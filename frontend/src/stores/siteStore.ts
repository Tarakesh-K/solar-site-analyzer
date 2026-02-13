import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ActivePanel,
  NumericSiteColumns,
  RangeExactFilter,
  SiteWithScoreFilter,
  SiteWithScores,
} from '@/types/sites'
import siteRepository from '@/api/siteRepository'
import { SCORE_THRESHOLDS, SUITABILITY_COLORS } from '@/constants/mapConstants'
import exportRepository from '@/api/exportRepository'
import { downloadFile } from '@/utils/file'
import type { WeightRequest } from '@/types/analyze'
import analyzeRepository from '@/api/analyzeRepository'

export const useSiteStore = defineStore('sites', () => {
  // --- STATE ---
  const sites = ref<SiteWithScores[]>([])
  const loading = ref<boolean>(false) // Specifically for initial fetches
  const isProcessing = ref<boolean>(false) // For Uploads/Recalculations
  const isExporting = ref<boolean>(false) // For CSV Exports
  const error = ref<string | null>(null)
  const activePanels = ref<ActivePanel[]>([])
  const weights = ref<WeightRequest>()

  const mapFilters = ref<SiteWithScoreFilter>({
    site_name: null,
    land_type: null,
    region: null,
    limit: null,
    offset: null,
    rangeExactFilter: [],
  })

  // --- ACTIONS: DATA MANAGEMENT ---

  /**
   * Uploads a CSV file to the backend and refreshes the map data.
   */
  const siteFileUpload = async (siteFile: File) => {
    isProcessing.value = true
    try {
      const response = await siteRepository.uploadSiteFile(siteFile)
      return response
    } catch (err) {
      console.error('Store: Upload failed', err)
      throw err // Let the component handle the UI notification
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Recalculates suitability scores across all sites based on new weights.
   */
  const recalculateWeights = async (payload: WeightRequest) => {
    isProcessing.value = true
    try {
      const response = await analyzeRepository.recalculateWeights(payload)
      return response
    } catch (err) {
      console.error('Store: Recalculation Failed:', err)
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * Exports the current site data as a CSV file.
   */
  const exportSites = async () => {
    if (isExporting.value) return
    isExporting.value = true
    try {
      const response = await exportRepository.exportSitesAsCsv()
      const filename = `solar-sites-${new Date().toISOString().slice(0, 10)}.csv`
      downloadFile(new Blob([response.data]), filename)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Standard fetch for the sites list.
   */
  async function fetchSites(queryParams?: string) {
    loading.value = true
    error.value = null
    try {
      const response = await siteRepository.getSites(queryParams)
      sites.value = response.data
    } catch (err) {
      console.error(err)
      error.value = err instanceof Error ? err.message : 'Unexpected error'
    } finally {
      loading.value = false
    }
  }

  // --- GETTERS ---
  const totalSites = computed(() => sites.value.length)

  // --- MUTATIONS / FILTER LOGIC ---
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

  const togglePanel = (panel: ActivePanel) => {
    const index = activePanels.value.indexOf(panel)
    if (index !== -1) {
      activePanels.value.splice(index, 1)
      if (panel === 'analytical') mapFilters.value.rangeExactFilter = []
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

  const setActivePanels = (panel: ActivePanel) => {
    activePanels.value = [...new Set([...activePanels.value, panel])]
  }

  const getScoreColor = (score: number): string => {
    if (score >= SCORE_THRESHOLDS.EXCELLENT) return SUITABILITY_COLORS.EXCELLENT
    if (score >= SCORE_THRESHOLDS.HIGH) return SUITABILITY_COLORS.HIGH
    if (score >= SCORE_THRESHOLDS.MODERATE) return SUITABILITY_COLORS.MODERATE
    if (score >= SCORE_THRESHOLDS.LOW) return SUITABILITY_COLORS.LOW
    return SUITABILITY_COLORS.POOR
  }

  return {
    // State
    sites,
    loading,
    isProcessing,
    isExporting,
    error,
    activePanels,
    mapFilters,
    weights,
    // Computed
    totalSites,
    // Actions
    fetchSites,
    siteFileUpload,
    recalculateWeights,
    exportSites,
    // Helpers
    setMapFilterValue,
    removeRangeFilter,
    togglePanel,
    setActivePanels,
    getScoreColor,
  }
})
