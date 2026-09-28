from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from backend.database import get_db
from backend.services.report_generator import ReportGenerator
from backend.services.audit_service import AuditService

router = APIRouter(prefix="/api/reports", tags=["Reports & Export"])

@router.get("/pdf")
def download_pdf_report(
    ward: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Downloads the official Ministry of Rural Development Urban Land Quality & Harmonization PDF Report.
    """
    pdf_bytes = ReportGenerator.generate_pdf_report(db, ward)

    AuditService.log_action(
        db=db,
        action="EXPORT_PDF_REPORT",
        module="REPORT",
        entity_type="REPORT",
        entity_id=ward or "ALL",
        details=f"Generated official PDF quality audit report for {ward or 'All Wards'}."
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=BHUMI_SYNC_Harmonization_Report_{ward or 'All_Wards'}.pdf"
        }
    )

@router.get("/csv")
def download_csv_export(
    ward: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Exports harmonized land parcel attributes as CSV.
    """
    csv_text = ReportGenerator.generate_csv_export(db, ward)

    AuditService.log_action(
        db=db,
        action="EXPORT_CSV_DATASET",
        module="REPORT",
        entity_type="DATASET",
        entity_id=ward or "ALL",
        details=f"Exported harmonized parcel records to CSV for {ward or 'All Wards'}."
    )

    return Response(
        content=csv_text,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=BHUMI_SYNC_Harmonized_Parcels_{ward or 'All_Wards'}.csv"
        }
    )

@router.get("/geojson")
def download_geojson_export(
    ward: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Exports harmonized spatial parcels as standard GeoJSON FeatureCollection.
    """
    geojson_data = ReportGenerator.generate_geojson_export(db, ward)

    AuditService.log_action(
        db=db,
        action="EXPORT_GEOJSON_DATASET",
        module="REPORT",
        entity_type="DATASET",
        entity_id=ward or "ALL",
        details=f"Exported harmonized spatial geometry to GeoJSON for {ward or 'All Wards'}."
    )

    return geojson_data
