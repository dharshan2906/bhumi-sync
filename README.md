# BHUMI-SYNC
### AI-Powered Urban Land Record Harmonization & Intelligence Platform

> **"One Map. One Truth. Smarter Land Records."**

---

### 🇮🇳 Smart India Hackathon (SIH 2026) Official Problem Statement

* **Organization:** Ministry of Rural Development, Government of India
* **Problem Statement Title:** *Automated Integration and Intelligent Harmonization of Multi-Source Geospatial Data for Urban Land Record Management*
* **Problem Statement ID:** `SIH26013`
* **Category:** Software
* **Theme:** Smart Automation
* **Programme:** National Land Record Modernization Programme (NLRMP) / Unique Land Parcel Identification Number (ULPIN)

---

## 1. Executive Summary & Vision

**BHUMI-SYNC** is a government-grade geospatial intelligence and decision-support platform engineered to integrate, reconcile, and harmonize heterogeneous urban land records into a unified **Parcel Digital Twin**.

### The Problem
Urban land records across India suffer from fragmented data silos:
1. **Cadastral Revenue Survey Maps** (often legacy or paper-derived vector polygons)
2. **Municipal GIS Layers** (urban local bodies' infrastructure footprints)
3. **Property Tax Assessment Ledgers** (tabular records with varying naming conventions)
4. **High-Resolution Drone / Optical Satellite Orthophotos** (0.3m GSD ground reality)

These disconnected datasets lead to severe discrepancies: **boundary displacement (2m–6m shifts)**, **area mismatches (>5% variance)**, **unauthorized structural encroachments**, and **unrecorded land-use conversions**.

### The BHUMI-SYNC Solution
BHUMI-SYNC implements an automated, mathematically rigorous GIS and AI pipeline that cleans, transforms, matches, and detects conflicts across datasets while preserving **statutory human-in-the-loop governance** where official land records are never modified without authorized officer sign-off.

---

## 2. Platform Architecture & Core Modules

```
┌───────────────────────────────────────────────────────────────────────────┐
│                           1. INGESTION ENGINE                             │
│   GeoJSON / Shapefile / KML / CSV / XLSX / GeoTIFF / Orthophoto Rasters  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                 2. GIS TOPOLOGY & CRS HARMONIZATION                       │
│  • Shapely make_valid() Geometry Repair  • PyProj Datum (EPSG:4326/UTM)  │
│  • Canonical Schema Normalization        • SI Metric Unit Conversion (m²) │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                  3. AI INTELLIGENCE & MATCHING ENGINE                     │
│  • Multi-Signal Scorer (IoU, Centroid Distance, Levenshtein, Area Ratio) │
│  • Computer Vision Building Footprint Segmentation (YOLO-Geo + U-Net)    │
│  • Dual-Epoch (2021→2026) Temporal Land-Cover Change Detection (NDBI)     │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                 4. CONFLICT DETECTION & DIGITAL TWIN                      │
│  • Boundary Shifts • Area Discrepancies • Structural Encroachments        │
│  • Unified Parcel Digital Twin Lineage & Multi-Source Layer Overlay       │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                5. STATUTORY HUMAN-IN-THE-LOOP VERIFICATION                │
│  • Authorized Officer Queue • Resolution Strategies • Decision Notes     │
│  • Cryptographic Immutable Audit Trail • ReportLab Certified PDF Report   │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Application Modules Summary

| Module | Purpose & Capabilities |
| :--- | :--- |
| **A. Dashboard** | Executive KPI cards, Chart.js graphs for verification status, conflict distributions, confidence stratification, and ward progress. |
| **B. GIS Map Explorer** | Interactive Leaflet map with switchable base layers (Satellite, Streets, Dark GIS), vector overlays (Cadastral, Municipal, AI Buildings, Conflicts), and click-to-inspect Digital Twin. |
| **C. Data Ingestion** | Drag-and-drop ingestion of GeoJSON, Shapefiles, CSV/XLSX, and GeoTIFFs with automated quality report and `[Fix Automatically]` geometry repair. |
| **D. CRS & Schema Harmonizer** | Visual PyProj coordinate transformation pipeline and fuzzy attribute mapper linking legacy names (`Khasra`, `Rakba`, `Plot_ID`) to canonical fields. |
| **E. Parcel Intelligence** | Searchable parcel registry with a live **Multi-Signal Matching Simulator** calculating string similarity, spatial IoU, and centroid distance. |
| **F. Conflict Engine** | Comprehensive detection of all 9 conflict types (Boundary mismatch, Area mismatch, Encroachment, Overlaps, Land-use clashes) with officer resolution workflows. |
| **G. AI Imagery Analysis** | Computer vision building footprint extraction with encroachment analysis and dual-epoch (2021 vs 2026) change detection. |
| **H. Source Comparison** | Synchronized side-by-side split screen comparing Historical Cadastral Maps against Drone Orthophotos with live opacity sliders. |
| **I. Human Verification** | Officer review queue with statutory sign-off, adoption strategies (Adopt Harmonized Boundary, Affirm Cadastral, Request Ground Survey), and remarks. |
| **J. Audit Trail** | Immutable audit log capturing all data uploads, coordinate transformations, AI detections, and officer decisions with before/after state diffs. |
| **K. Reports & Export** | Official Ministry PDF report generation with seals and signatures, tabular CSV ledger exports, and OGC GeoJSON vector downloads. |
| **L. Presentation Mode** | Full-screen interactive SIH pitch deck explaining the problem, architecture, spotlight case studies, and impact. |

---

## 4. Key Spotlight Case Studies in Demo Data

* **`Parcel P-102` (Survey No. 104/2 • Ward 12):**
  * **Recorded Ledger Area:** `1,250.0 m²`
  * **GIS Calculated Area:** `1,184.0 m²` (5.28% variance flagged for mutation)
  * **Boundary Displacement:** `4.7m` shift between cadastral survey and municipal GIS
  * **AI Building Encroachment:** `BLD-P-102-A` detected extending `18.4 m²` outside plot boundary
  * **Data Matching Confidence:** `94.0%`

* **`Parcel P-104` (Survey No. 106/1):**
  * **Temporal Land-Use Change:** Historical open plot converted into unauthorized commercial construction post-2021 survey.

* **`Parcel P-117` & `P-118`:**
  * **Parcel Overlap:** `7.4%` mutual spatial boundary overlap requiring boundary reconciliation.

---

## 5. Technology Stack

* **Frontend:** React 19, TypeScript, Vite, Leaflet, Chart.js, Lucide-React, Canvas-Confetti, Vanilla CSS Government Design System
* **Backend:** Python 3.14 / 3.11, FastAPI, Uvicorn, Pydantic v2
* **Geospatial & Mathematics:** Shapely 2.1 (GEOS topology & `make_valid`), PyProj 3.8 (PROJ coordinate transformations), NumPy, Scikit-learn, SciPy
* **Data & Export:** SQLAlchemy, SQLite / PostgreSQL + PostGIS, Pandas, OpenPyXL, ReportLab (Official PDF Generator)
* **DevOps & Containers:** Docker, Docker Compose, Nginx

---

## 6. Quick Start & Setup Instructions

### Prerequisites
* Python 3.10+
* Node.js v18+ and npm

### Local Installation & Launch

1. **Clone or navigate to repository root:**
   ```bash
   cd c:\SIH_PROJECT\PS2
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Launch Application (Single Command):**
   ```bash
   python run_servers.py
   ```
   *(Or double-click `start.bat` on Windows)*

5. **Access Application:**
   * **Web Platform:** [http://localhost:5173](http://localhost:5173)
   * **FastAPI Backend & Swagger API Docs:** [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)

---

## 7. Docker / PostGIS Deployment (Optional)

To launch the full enterprise stack with containerized PostgreSQL + PostGIS:
```bash
docker-compose up --build
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:8000`
* **PostGIS Database:** `localhost:5432` (`bhumi_sync`)

---

## 8. SIH Demonstration Workflow

1. Click **"★ Presentation Mode"** in the top header to walk the jury through the problem statement, solution architecture, and governance principles.
2. Click **"▶ Run Live Demo"** to trigger the automated 8-step ingestion, CRS transform, AI vision scan, and conflict detection pipeline.
3. Open **"GIS Map Explorer"** to inspect vector layers, toggle cadastral boundaries, and click on **Parcel P-102** to inspect its complete Digital Twin.
4. Open **"Source Comparison"** to demonstrate synchronized split-screen comparison with opacity controls.
5. Open **"Human Verification"** to affirm resolutions, record officer notes, and commit decisions to the immutable **Audit Trail**.
6. Open **"Reports & Export"** to generate and download the certified statutory PDF audit report.

---

### Statutory Disclaimer
*BHUMI-SYNC is an automated decision-support system developed for the Smart India Hackathon. It does not possess autonomous legal authority to alter registered land records. All final property determinations remain under the jurisdiction of authorized government revenue officers and settlement authorities.*
