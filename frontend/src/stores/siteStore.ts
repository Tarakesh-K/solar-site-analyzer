import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RangeExactFilter, SiteWithScoreFilter, SiteWithScores } from '@/types/sites' // Note: Use singular 'Site' if it's one object
import siteRepository from '@/api/siteRepository'
import { SCORE_THRESHOLDS, SUITABILITY_COLORS } from '@/constants/mapConstants'

export const useSiteStore = defineStore('sites', () => {
  // --- STATE ---
  const sites = ref<SiteWithScores[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const mapFilters = ref<SiteWithScoreFilter>({
    site_name: null,
    land_type: null,
    region: null,
    limit: null,
    offset: null,
    rangeExactFilter: [],
  })

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
      }
    } else {
      update = {
        col: incoming.col,
        score: null,
        min_score: incoming.min_score ?? existing?.min_score ?? null,
        max_score: incoming.max_score ?? existing?.max_score ?? null,
      }
    }

    if (index !== -1) {
      filters[index] = update
    } else {
      filters.push(update)
    }
  }

  // --- ACTIONS ---
  async function fetchSites() {
    loading.value = true
    error.value = null
    try {
      const response = await siteRepository.getSites()
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

  // --- RESET ACTION (Good practice) ---
  function clearSites() {
    sites.value = []
  }

  return {
    sites,
    loading,
    mapFilters,
    error,
    totalSites,
    fetchSites,
    clearSites,
    getScoreColor,
    setMapFilterValue,
  }
})
