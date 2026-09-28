import io
import csv
import json
import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.models import Parcel, Conflict, Dataset, Building, LandUseChange

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class ReportGenerator:
    @staticmethod
    def generate_pdf_report(db: Session, ward: str = None) -> bytes:
        """
        Generates an official Government Urban Land Record Quality & Harmonization Report PDF.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'GovTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#0f2942'),
            alignment=1
        )
        subtitle_style = ParagraphStyle(
            'GovSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569'),
            alignment=1
        )
        section_heading = ParagraphStyle(
            'SectionHead',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#0f2942'),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'GovBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#1e293b')
        )
        table_cell_style = ParagraphStyle(
            'CellText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#0f172a')
        )
        table_header_style = ParagraphStyle(
            'HeaderCellText',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.white
        )

        story = []

        # 1. Header & Emblems
        story.append(Paragraph("GOVERNMENT OF INDIA • MINISTRY OF RURAL DEVELOPMENT", subtitle_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph("BHUMI-SYNC: URBAN LAND RECORD HARMONIZATION & INTELLIGENCE SYSTEM", title_style))
        story.append(Spacer(1, 2))
        story.append(Paragraph("National Land Record Modernization Programme (NLRMP) • SIH Problem Statement #SIH26013", subtitle_style))
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0f2942'), spaceBefore=4, spaceAfter=12))

        # Query metrics
        parcel_query = db.query(Parcel)
        if ward and ward != "ALL":
            parcel_query = parcel_query.filter(Parcel.ward == ward)
        
        parcels = parcel_query.all()
        total_parcels = len(parcels)
        verified_count = sum(1 for p in parcels if p.verification_status == "VERIFIED")
        pending_count = sum(1 for p in parcels if p.verification_status == "PENDING")
        review_count = sum(1 for p in parcels if p.verification_status == "UNDER_REVIEW")

        conflict_query = db.query(Conflict).join(Parcel)
        if ward and ward != "ALL":
            conflict_query = conflict_query.filter(Parcel.ward == ward)
        conflicts = conflict_query.all()

        boundary_conflicts = sum(1 for c in conflicts if c.conflict_type == "BOUNDARY_MISMATCH")
        area_conflicts = sum(1 for c in conflicts if c.conflict_type == "AREA_MISMATCH")
        encroachments = sum(1 for c in conflicts if c.conflict_type == "BUILDING_OUTSIDE_PARCEL")
        lu_changes = sum(1 for c in conflicts if c.conflict_type == "LAND_USE_INCONSISTENCY")

        # 2. Metadata Block
        now_str = datetime.datetime.utcnow().strftime("%d-%b-%Y %H:%M:%S UTC")
        meta_data = [
            [
                Paragraph("<b>Report Ref:</b> BSYNC-AUDIT-2026/092", body_style),
                Paragraph(f"<b>Generated On:</b> {now_str}", body_style)
            ],
            [
                Paragraph(f"<b>Jurisdiction / Ward:</b> {ward if ward else 'All Urban Sectors'}", body_style),
                Paragraph("<b>Classification:</b> OFFICIAL DECISION-SUPPORT AUDIT", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[270, 270])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))

        # 3. Executive Summary KPI Table
        story.append(Paragraph("1. EXECUTIVE LAND RECORD HARMONIZATION SUMMARY", section_heading))
        kpi_data = [
            [
                Paragraph("<b>Total Land Parcels Ingested:</b>", body_style),
                Paragraph(f"<b>{total_parcels:,}</b>", body_style),
                Paragraph("<b>Boundary Alignment Conflicts:</b>", body_style),
                Paragraph(f"<font color='#dc2626'><b>{boundary_conflicts}</b></font>", body_style)
            ],
            [
                Paragraph("<b>Parcels Verified & Affirmed:</b>", body_style),
                Paragraph(f"<font color='#16a34a'><b>{verified_count:,} ({round(verified_count/max(1,total_parcels)*100,1)}%)</b></font>", body_style),
                Paragraph("<b>Area Ledger Discrepancies (>5%):</b>", body_style),
                Paragraph(f"<font color='#d97706'><b>{area_conflicts}</b></font>", body_style)
            ],
            [
                Paragraph("<b>Pending Officer Review:</b>", body_style),
                Paragraph(f"<font color='#2563eb'><b>{pending_count:,}</b></font>", body_style),
                Paragraph("<b>Structural Encroachments Detected:</b>", body_style),
                Paragraph(f"<font color='#dc2626'><b>{encroachments}</b></font>", body_style)
            ],
            [
                Paragraph("<b>Under Active Field Inquiry:</b>", body_style),
                Paragraph(f"<b>{review_count}</b>", body_style),
                Paragraph("<b>Unrecorded Land-Use Transitions:</b>", body_style),
                Paragraph(f"<b>{lu_changes}</b>", body_style)
            ]
        ]
        kpi_table = Table(kpi_data, colWidths=[150, 120, 150, 120])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 10))

        # 4. Critical Discrepancy Register (First 15 sample conflicts)
        story.append(Paragraph("2. REGISTER OF DETECTED CONFLICTS & DISCREPANCIES (TOP PRIORITY)", section_heading))
        conf_rows = [[
            Paragraph("<b>Code</b>", table_header_style),
            Paragraph("<b>Parcel ID</b>", table_header_style),
            Paragraph("<b>Conflict Type</b>", table_header_style),
            Paragraph("<b>Severity</b>", table_header_style),
            Paragraph("<b>Recorded vs GIS Value</b>", table_header_style),
            Paragraph("<b>AI / GIS Explanation</b>", table_header_style)
        ]]

        for c in conflicts[:12]:
            p_ref = next((p.parcel_id for p in parcels if p.id == c.parcel_id), f"ID-{c.parcel_id}")
            sev_color = "#dc2626" if c.severity == "CRITICAL" else "#d97706"
            conf_rows.append([
                Paragraph(c.conflict_code, table_cell_style),
                Paragraph(p_ref, table_cell_style),
                Paragraph(c.conflict_type.replace("_", " "), table_cell_style),
                Paragraph(f"<font color='{sev_color}'><b>{c.severity}</b></font>", table_cell_style),
                Paragraph(f"{c.recorded_value or ''} <br/>vs {c.gis_value or ''}", table_cell_style),
                Paragraph(c.explanation[:95] + ("..." if len(c.explanation) > 95 else ""), table_cell_style)
            ])

        conf_table = Table(conf_rows, colWidths=[65, 55, 95, 75, 110, 140])
        conf_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f2942')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('PADDING', (0, 0), (-1, -1), 4),
            ('VALIGN', (0, 0), (-1, -1), 'TOP')
        ]))
        story.append(conf_table)
        story.append(Spacer(1, 14))

        # 5. Governance Disclaimer & Officer Sign-off block
        story.append(Paragraph("3. STATUTORY GOVERNANCE ATTESTATION & SIGN-OFF", section_heading))
        story.append(Paragraph(
            "<b>Important Legal & Statutory Notice:</b> BHUMI-SYNC operates strictly as an intelligent decision-support "
            "and multi-source harmonization platform under the auspices of the Ministry of Rural Development. "
            "All conflict flags, matching confidence indices, and AI-detected footprints are advisory in nature and subject "
            "to final administrative sign-off by the authorized Land Settlement & Tehsildar Authority.",
            ParagraphStyle('GovNotice', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, leading=11, textColor=colors.HexColor('#475569'))
        ))
        story.append(Spacer(1, 16))

        sign_data = [
            [
                Paragraph("<b>Prepared By:</b><br/>BHUMI-SYNC Automated GIS Pipeline<br/>Datum: WGS 84 / UTM 43N", body_style),
                Paragraph("<b>Verified By (GIS Officer):</b><br/>Shri A. K. Sharma<br/>Sr. Land Records Officer", body_style),
                Paragraph("<b>Approved By (Authorizing Registrar):</b><br/>Dr. Sunita V. Deshmukh<br/>Director, Urban Land Records", body_style)
            ]
        ]
        sign_table = Table(sign_data, colWidths=[180, 180, 180])
        sign_table.setStyle(TableStyle([
            ('LINEABOVE', (0, 0), (-1, 0), 1, colors.HexColor('#0f2942')),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(sign_table)

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_csv_export(db: Session, ward: str = None) -> str:
        """
        Generates CSV dataset of harmonized parcels.
        """
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Parcel_ID", "Survey_Number", "Property_ID", "Ward", "Zone",
            "Owner_Reference", "Recorded_Area_sqm", "GIS_Area_sqm", "Area_Variance_pct",
            "Recorded_Land_Use", "Detected_Land_Use", "Matching_Confidence_pct",
            "Verification_Status", "Centroid_Lat", "Centroid_Lon", "Verified_By"
        ])

        query = db.query(Parcel)
        if ward and ward != "ALL":
            query = query.filter(Parcel.ward == ward)

        for p in query.all():
            writer.writerow([
                p.parcel_id, p.survey_number, p.property_id or "", p.ward, p.zone,
                p.owner_reference, p.recorded_area, p.gis_area, p.area_difference_pct,
                p.land_use, p.detected_land_use, p.confidence,
                p.verification_status, p.centroid_lat, p.centroid_lon, p.verified_by or ""
            ])

        return output.getvalue()

    @staticmethod
    def generate_geojson_export(db: Session, ward: str = None) -> Dict[str, Any]:
        """
        Generates GeoJSON FeatureCollection of harmonized parcels.
        """
        features = []
        query = db.query(Parcel)
        if ward and ward != "ALL":
            query = query.filter(Parcel.ward == ward)

        for p in query.all():
            features.append({
                "type": "Feature",
                "id": p.parcel_id,
                "geometry": p.geometry,
                "properties": {
                    "parcel_id": p.parcel_id,
                    "survey_number": p.survey_number,
                    "property_id": p.property_id,
                    "ward": p.ward,
                    "zone": p.zone,
                    "owner": p.owner_reference,
                    "recorded_area": p.recorded_area,
                    "gis_area": p.gis_area,
                    "area_diff_pct": p.area_difference_pct,
                    "land_use": p.land_use,
                    "detected_land_use": p.detected_land_use,
                    "confidence": p.confidence,
                    "verification_status": p.verification_status,
                    "conflict_count": len(p.conflicts)
                }
            })

        return {
            "type": "FeatureCollection",
            "name": f"BHUMI_SYNC_Harmonized_Parcels_{ward or 'All'}",
            "crs": {
                "type": "name",
                "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
            },
            "features": features
        }
