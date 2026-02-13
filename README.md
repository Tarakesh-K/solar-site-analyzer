1. Launch the Containers
    From the project root directory, run:

    "docker compose up --build -d"

2. Import Initial Data
    The database needs to be populated with the provided dump to display the Top 10 Sites and Top 3 Comparison charts. Run this command:

    "docker exec -i solar-site-analyzer-db-1 mysql -u root -p'Root@123' solar_site_analyzer < ./backend/dump/latest_dump.sql"

3. Access
    Access the Frontend in
    http://localhost:5173

4. Frontend

    Has a Side Bar, Top Bar and the main one
    Map - Leaflet
    Dashboard - For displaying the data
    Analyze - Recalculating weights
    Site Upload/Update - For uplodaing new sites this causes an upsert operation

    TopBar
    Export CSV - Export the results as a CSV file
    FILTERS - Adds filters and updates the current state by sending query paramters to backend

    Folder Structure
    It is seperated into several folders for SOLID principles implementation

    frontend/
    ├── src/
    │   ├── api/          # Axios configurations and service calls
    │   ├── components/   # UI components (SideBar, TopBar, Charts)
    │   ├── assets/       # For defining CSS (Tailwind)
    │   ├── composables/  # Reusable logic (DRY: useAnalysis, useLeaflet)
    │   ├── constants/    # Constants for looping through data for UI (Following DRY Principles)
    │   ├── views/        # Page-level components (Dashboard, Upload)
    │   ├── router/       # For defining the frontend routes
    │   ├── services/     # For defining global functions like axiosInstance. Interceptor not implemented since there was no requirement for authentication.
    │   └── utils/        # CSV Export and data formatting helpers
    │   └── stores/       # For global state management using Pinia
    │   └── types/        # For managing types

5. Backend

    The backend Django is written on the basis of 3 layer architecture

    Service Layer Pattern: Business logic for suitability score calculations is decoupled from the API Views, allowing for easy unit testing.
    Model-View-Serializer (MVS): Strict separation of data storage, logic, and JSON presentation.
    Upsert Logic: Implemented update_or_create logic for site uploads to ensure data integrity and prevent duplicates.
    Server-Side Filtering: Leveraged Django’s QuerySet API to handle "Top 10" and "Top 3" logic, reducing frontend overhead.

    backend/
    ├── dump/                         # Database snapshots (latest_dump.sql)
    ├── sites/                        # Main application logic
    │   ├── migrations/               # Schema history (Cleaned: 0001_initial)
    │   ├── models.py                 # Data definitions (MySQL)
    │   ├── serializers.py            # Data transformation & validation
    │   ├── services.py               # Business logic (Suitability calculations)
    │   ├── views.py                  # Request handling & Service orchestration
    │   ├── urls.py                   # App-specific routing
    │   └── utils.py                  # Helper functions (File parsing, units)
    ├── solar_analyzer_project/       # Project settings and WSGI/ASGI config
    ├── sql_views/                    # Optimized SQL View definitions
    ├── venv/                         # Local virtual environment (ignored in git)
    └── manage.py                     # Django management entry point

    ├── api
    │   GET  ├── /sites/             # Fetch all sites (Supports query params)
    │   POST ├── /sites/             # Upsert sites (Accepts CSV/JSON)
    │   GET  ├── /sites/{id}/        # Fetch specific site details
    │   POST ├── /sites/analyze/     # Recalculate scores based on weights
    │   GET  ├── /sites/statistics/  # Aggregate data for Dashboard/Charts
    │   GET  ├── /sites/export/      # Export filtered data as CSV

6. Payolad Examples

    POST Requests
    1. /sites/ - 

    {
        site_id: File (Csv File)
    }

    2. /sites/analyze - 

    {
        "weights": {
            "solar": 0.40,
            "area": 0.20,
            "grid": 0.15,
            "slope": 0.20,
            "infra": 0.05
        }
    }

7. Features & Requirements
    Top 10 Sites: Dashboard automatically filters and displays the highest-performing sites based on weighted suitability.

    Top 3 Analytics: Interactive bar charts comparing the top 3 sites across specific parameters.

    Interactive Map: Leaflet-based visualization for spatial distribution of sites.

    Real-time Recalculation: Ability to adjust factor weights and update site scores globally.

    Dockerized Environment: Fully isolated Frontend (Vite), Backend (Django), and Database (MySQL) services.

8. Design Decisions & Assumptions
    Normalization: All raw data (km, sqm, degrees) is normalized to a 0-100 scale before weights are applied.

    Atomic Transactions: Upload and Analysis tasks are wrapped in transaction.atomic() to prevent data corruption on failure.

    Reverse Proxy Ready: The /api prefix ensures the app is ready for Nginx/Production deployment.

9. Database Engineering (SQL Views)    
    sql-views/
    ├── view_sites_with_scores.sql    # Joins Sites and AnalysisResults for fast reads
    ├── view_dashboard_stats.sql      # Aggregates averages and totals at the DB level
    I am using views as it makes joins and does not reduce the performance on Django

10. Suitability Score Logic
    Final Score Calculation Logic:
    1. Normalize: Raw metrics (e.g., Grid Distance 0-20km) are mapped to a 0-100 score.
    2. Weight: Each score is multiplied by its specific weight (e.g., Solar * 0.35).
    3. Sum: The 5 weighted components are totaled to produce the Suitability Score.