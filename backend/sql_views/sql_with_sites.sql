CREATE OR REPLACE VIEW sites_with_scores AS
SELECT 
    s.site_id,
    s.site_name,
    s.latitude,
    s.longitude,
    s.area_sqm,
    s.solar_irradiance_kwh,
    s.grid_distance_km,
    s.slope_degrees,
    s.road_distance_km,
    s.elevation_m,
    s.land_type,
    s.region,
    ar.solar_irradiance_score,
    ar.area_score,
    ar.grid_distance_score,
    ar.slope_score,
    ar.infrastructure_score,
    ar.total_suitability_score,
    ar.analysis_timestamp
FROM sites s
LEFT JOIN (
    SELECT site_id, 
           solar_irradiance_score,
           area_score,
           grid_distance_score,
           slope_score,
           infrastructure_score,
           total_suitability_score,
           analysis_timestamp,
           ROW_NUMBER() OVER (PARTITION BY site_id ORDER BY analysis_timestamp DESC) as rn
    FROM analysis_results
) ar ON s.site_id = ar.site_id AND ar.rn = 1;