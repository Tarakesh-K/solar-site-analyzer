import type { NumericSiteColumns } from '@/types/sites'

export type FilterMode = 'exact' | 'range'

export type RangeExactInputT = {
  column: NumericSiteColumns
  label: string
  shortLabel: string
}
