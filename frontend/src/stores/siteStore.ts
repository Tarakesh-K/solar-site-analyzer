import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ActivePanel,
  NumericSiteColumns,
  RangeExactFilter,
  SiteWithScoreFilter,
  SiteWithScores,
} from '@/types/sites' // Note: Use singular 'Site' if it's one object
import siteRepository from '@/api/siteRepository'
import { SCORE_THRESHOLDS, SUITABILITY_COLORS } from '@/constants/mapConstants'
import exportRepository from '@/api/exportRepository'
import { downloadFile } from '@/utils/file'
import type { WeightRequest } from '@/types/analyze'
import analyzeRepository from '@/api/analyzeRepository'

export const useSiteStore = defineStore('sites', () => {
  // --- STATE ---
  const sites = ref<SiteWithScores[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const activePanels = ref<ActivePanel[]>([])
  const isExporting = ref<boolean>(false)
  const weights = ref<WeightRequest>()
  const mapFilters = ref<SiteWithScoreFilter>({
    site_name: null,
    land_type: null,
    region: null,
    limit: null,
    offset: null,
    rangeExactFilter: [],
  })

  const exportSites = async () => {
    if (isExporting.value) return

    isExporting.value = true
    try {
      const response = await exportRepository.exportSitesAsCsv()

      // Create a timestamped filename
      const filename = `solar-sites-${new Date().toISOString().slice(0, 10)}.csv`

      // Trigger the utility
      downloadFile(new Blob([response.data]), filename)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      isExporting.value = false
    }
  }

  const recalculateWeights = async (payload: WeightRequest) => {
    try {
      const response = await analyzeRepository.recalculateWeights(payload)
      return response
    } catch (error) {
      console.error('Recalculation Failed:', error)
    }
  }

  // --- GETTERS ---
  const totalSites = computed(() => sites.value.length)

  // --- MUTATIONS ---
  const setMapFilterValue = <K extends keyof SiteWithScoreFilter>(
    key: K,
    value: SiteWithScoreFilter[K] | RangeExactFilter,
  ) => {
    if (key !== 'rangeExactFilter') {
      mapFilters.value[key] = value as SiteWithScoreFilter[K]
      return
    }

    const filters = (mapFilters.value.rangeExactFilter ??= [])
    const incoming = value as RangeExactFilter
    const index = filters.findIndex((f) => f.col === incoming.col)
    const existing = index !== -1 ? filters[index] : null
    const isExact = incoming.score != null

    let update: RangeExactFilter

    if (isExact) {
      update = {
        col: incoming.col,
        score: incoming.score!,
        min_score: null,
        max_score: null,
        mode: incoming.mode,
      }
    } else {
      update = {
        col: incoming.col,
        score: null,
        min_score: incoming.min_score ?? existing?.min_score ?? null,
        max_score: incoming.max_score ?? existing?.max_score ?? null,
        mode: incoming.mode,
      }
    }

    if (index !== -1) {
      filters[index] = update
    } else {
      filters.push(update)
    }
  }

  const removeRangeFilter = (column: NumericSiteColumns) => {
    if (mapFilters.value.rangeExactFilter) {
      mapFilters.value.rangeExactFilter = mapFilters.value.rangeExactFilter.filter(
        (f) => f.col !== column,
      )
    }
  }

  // --- SETTERS ---
  const setActivePanels = (panel: ActivePanel) => {
    activePanels.value = [...new Set([...activePanels.value, panel])]
  }

  const togglePanel = (panel: ActivePanel) => {
    const index = activePanels.value.indexOf(panel)

    if (index !== -1) {
      activePanels.value.splice(index, 1)

      if (panel === 'analytical') {
        mapFilters.value.rangeExactFilter = []
      }
      if (panel === 'search') {
        mapFilters.value.site_name = null
        mapFilters.value.region = null
        mapFilters.value.land_type = null
      }
      if (panel === 'system') {
        mapFilters.value.limit = null
        mapFilters.value.offset = null
      }
    } else {
      activePanels.value.push(panel)
    }
  }

  // --- ACTIONS ---
  async function fetchSites(queryParams?: string) {
    loading.value = true
    error.value = null
    try {
      const response = await siteRepository.getSites(queryParams)
      sites.value = response.data
    } catch (err: unknown) {
      // Narrow the type from unknown to Error
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'An unexpected error occurred'
      }

      console.error('Fetch Error:', err)
    } finally {
      loading.value = false
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return SUITABILITY_COLORS.EXCELLENT
    if (score >= SCORE_THRESHOLDS.HIGH) return SUITABILITY_COLORS.HIGH
    if (score >= SCORE_THRESHOLDS.MODERATE) return SUITABILITY_COLORS.MODERATE
    if (score >= SCORE_THRESHOLDS.LOW) return SUITABILITY_COLORS.LOW
    return SUITABILITY_COLORS.POOR
  }

  return {
    sites,
    loading,
    activePanels,
    mapFilters,
    weights,
    isExporting,
    error,
    totalSites,
    setMapFilterValue,
    setActivePanels,
    fetchSites,
    exportSites,
    getScoreColor,
    removeRangeFilter,
    togglePanel,
    recalculateWeights,
  }
})
