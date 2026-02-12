import type { FilterMode } from '@/types/header'

export type Sites = {
  site_id: number
  site_name: string
  latitude: number
  longitude: number
  area_sqm: number
  solar_irradance_kwh: number
  grid_distance_km: number
  slope_degrees: number
  road_distance_m: number
  elevation_m: number
  land_type: string
  region: string
  created_at: Date
  updated_at: Date
}

export type SiteWithScores = {
  site_id: number
  site_name: string
  latitude: number
  longitude: number
  area_sqm: number
  solar_irradiance_kwh: number
  grid_distance_km: number
  slope_degrees: number
  road_distance_km: number
  elevation_m: number
  land_type: string
  region: string
  solar_irradiance_score: number
  area_score: number
  grid_distance_score: number
  slope_score: number
  infrastructure_score: number
  total_suitability_score: number
  analysis_timestamp: Date
}

export type NumericSiteColumns = {
  [K in keyof SiteWithScores]: SiteWithScores[K] extends number ? K : never
}[keyof SiteWithScores]

export type SiteWithScoreFilter = {
  rangeExactFilter?: RangeExactFilter[]
  site_name?: string | null
  land_type?: string | null
  region?: string | null
  limit?: number | null
  offset?: number | null
}

export type RangeExactFilter = {
  col: NumericSiteColumns
  max_score?: number | null
  min_score?: number | null
  score?: number | null
  mode?: FilterMode
}
