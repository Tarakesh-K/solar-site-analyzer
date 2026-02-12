from django.db import models

class Sites(models.Model):
    site_id = models.AutoField(primary_key=True)
    site_name = models.CharField(max_length=255)

    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)

    area_sqm = models.IntegerField()
    solar_irradiance_kwh = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text="Average daily solar irradiance in kWh/m²/day"
    )

    grid_distance_km = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Distance to nearest power grid in kilometers"
    )

    slope_degrees = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        help_text="Terrain slope in degrees"
    )

    road_distance_km = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Distance to nearest road in kilometers"
    )

    elevation_m = models.IntegerField(
        help_text="Elevation above sea level in meters"
    )

    land_type = models.CharField(max_length=50)
    region = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sites"
        indexes = [
            models.Index(fields=["latitude"]),
            models.Index(fields=["longitude"]),
            models.Index(fields=["region"]),
            models.Index(fields=["land_type"]),
        ]

    def __str__(self):
        return self.site_name
    
class AnalysisParameters(models.Model):
    param_id = models.AutoField(primary_key=True)
    parameter_name = models.CharField(max_length=100, unique=True)

    weight_value = models.DecimalField(
        max_digits=4,
        decimal_places=3,
        help_text="Weight value between 0 and 1"
    )

    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "analysis_parameters"

    def __str__(self):
        return self.parameter_name
    
class AnalysisResults(models.Model):
    result_id = models.AutoField(primary_key=True)

    site = models.ForeignKey(
        Sites,
        on_delete=models.CASCADE,
        related_name="analysis_results"
    )

    solar_irradiance_score = models.DecimalField(max_digits=5, decimal_places=2)
    area_score = models.DecimalField(max_digits=5, decimal_places=2)
    grid_distance_score = models.DecimalField(max_digits=5, decimal_places=2)
    slope_score = models.DecimalField(max_digits=5, decimal_places=2)
    infrastructure_score = models.DecimalField(max_digits=5, decimal_places=2)

    total_suitability_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Final weighted score out of 100"
    )

    analysis_timestamp = models.DateTimeField(auto_now_add=True)

    parameters_snapshot = models.JSONField(
        blank=True,
        null=True,
        help_text="JSON snapshot of weights used for this analysis"
    )

    class Meta:
        db_table = "analysis_results"
        indexes = [
            models.Index(fields=["total_suitability_score"]),
            models.Index(fields=["site"]),
            models.Index(fields=["analysis_timestamp"]),
        ]

    def __str__(self):
        return f"Result {self.result_id} for Site {self.site_id}"

class SitesWithScores(models.Model):
    """
    This model maps to the SQL view 'sites_with_scores'.
    The view should already exist in your database.
    """
    site_id = models.IntegerField(primary_key=True)
    site_name = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    area_sqm = models.IntegerField()
    solar_irradiance_kwh = models.DecimalField(max_digits=4, decimal_places=2)
    grid_distance_km = models.DecimalField(max_digits=5, decimal_places=2)
    slope_degrees = models.DecimalField(max_digits=4, decimal_places=2)
    road_distance_km = models.DecimalField(max_digits=5, decimal_places=2)
    elevation_m = models.IntegerField()
    land_type = models.CharField(max_length=50)
    region = models.CharField(max_length=100)
    
    # Scores from latest analysis
    solar_irradiance_score = models.DecimalField(max_digits=5, decimal_places=2)
    area_score = models.DecimalField(max_digits=5, decimal_places=2)
    grid_distance_score = models.DecimalField(max_digits=5, decimal_places=2)
    slope_score = models.DecimalField(max_digits=5, decimal_places=2)
    infrastructure_score = models.DecimalField(max_digits=5, decimal_places=2)
    total_suitability_score = models.DecimalField(max_digits=5, decimal_places=2)
    analysis_timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        managed = False
        db_table = 'sites_with_scores'
        ordering = ['-total_suitability_score']

    def __str__(self):
        return self.site_name