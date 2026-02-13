import type { RangeExactInputT, SearchInputT } from '@/types/header'

export const SUITABILITY_COLORS = {
  EXCELLENT: '#15803d',
  HIGH: '#4ade80',
  MODERATE: '#facc15',
  LOW: '#fb923c',
  POOR: '#ef4444',
} as const

export const SCORE_THRESHOLDS = {
  EXCELLENT: 85,
  HIGH: 70,
  MODERATE: 50,
  LOW: 30,
} as const

export const HOME_NAVBAR_CONSTANTS = [
  {
    value: 'Map',
    route: '/',
  },
  {
    value: 'Dashboard',
    route: '/dashboard',
  },
  {
    value: 'Analyze',
    route: '/analyze',
  },
]

export const ALLOWED_QUERY_PARAMS_FOR_SITE = [
  'col',
  'min_score',
  'max_score',
  'score',
  'export',
  'prefix',
  'limit',
  'offset',
]

export const RANGE_EXACT_COLUMNS_FOR_SITES: RangeExactInputT[] = [
  {
    column: 'latitude',
    label: 'Latitude',
    shortLabel: 'Lat',
  },
  {
    column: 'longitude',
    label: 'Longitude',
    shortLabel: 'lon',
  },
  {
    column: 'area_score',
    label: 'Area',
    shortLabel: 'area',
  },
  {
    column: 'solar_irradiance_score',
    label: 'Solar',
    shortLabel: 'solar',
  },
  {
    column: 'grid_distance_km',
    label: 'Grid',
    shortLabel: 'grid',
  },
  {
    column: 'infrastructure_score',
    label: 'Road',
    shortLabel: 'road',
  },
  {
    column: 'total_suitability_score',
    label: 'Suitability',
    shortLabel: 'suitability',
  },
  {
    column: 'slope_score',
    label: 'Slope',
    shortLabel: 'slope',
  },
]

export const SEARCH_EXACT_COLUMNS_FOR_SITES: SearchInputT[] = [
  {
    column: 'site_name',
    label: 'Site Name',
    placeholder: 'Search by name...',
  },
  {
    column: 'region',
    label: 'Region',
    placeholder: 'Enter region...',
  },
  {
    column: 'land_type',
    label: 'Land Type',
    placeholder: 'Enter land type...',
  },
]

export const RANGE_LIMIT_FOR_SITES: SearchInputT[] = [
  {
    column: 'limit',
    label: 'Limit',
    placeholder: 'Filter by limit',
  },
  {
    column: 'offset',
    label: 'Offset',
    placeholder: 'Starting site',
  },
]