from django.urls import path
from sites.views import  SiteUploadView, SiteView, SiteAnalysisView, SiteStatiscsSummary, SiteExportSummary

urlpatterns = [
    path("", SiteUploadView.as_view(), name="upload-site"),
    path("<int:site_id>/", SiteView.as_view(), name="site-detail"),
    path("analyze/", SiteAnalysisView.as_view(), name="site-list"),
    path("statistics/", SiteStatiscsSummary.as_view(), name="site-statistics"),
    path("export/", SiteExportSummary.as_view(), name="site-export"),
]