export type SiteStatistics = {
  kpi: KPI
  stats: Stats
  site_data: SiteData
}

export type KPI = {
  total_sites: number
}

export type Stats = {
  avg_suitability_score: number
  total_land_area: number
  factor_averages: FactorAverages
}

export type FactorAverages = {
  solar_irradiance: number
  land_area: number
  grid_proximity: number
  terrain_slope: number
  infrastructure: number
}

export type SiteData = {
  site_scoring_system: SiteScoringSystem[]
}

export type SiteScoringSystem = {
  site_id: number
  site_name: string
  latitude: number
  longitude: number

  solar_irradiance: number
  available_land_area: number
  distance_from_grid: number
  slope_degrees: number
  terrain_elevation: number

  land_type: string
  region: string
  proximity_to_infra: number

  total_suitability_score: number
}