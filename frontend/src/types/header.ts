import type { NumericSiteColumns } from '@/types/sites'

export type FilterMode = 'exact' | 'range'

export type RangeExactInputT = {
  column: NumericSiteColumns
  label: string
  shortLabel: string
}

export type SearchInputT = {
  column: SearchT
  label: string
  placeholder: string
}

export type SearchT = 'site_name' | 'region' | 'land_type' | 'limit' | 'offset'