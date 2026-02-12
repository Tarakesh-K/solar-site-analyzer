import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SiteWithScores } from '@/types/sites' // Note: Use singular 'Site' if it's one object
import siteRepository from '@/api/siteRepository'

export const useSiteStore = defineStore('sites', () => {
  // --- STATE ---
  const sites = ref<SiteWithScores[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // --- GETTERS ---
  const totalSites = computed(() => sites.value.length)

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
    if (score >= 85) return '#15803d' // Deep Green
    if (score >= 70) return '#4ade80' // Light Green
    if (score >= 50) return '#facc15' // Yellow
    if (score >= 30) return '#fb923c' // Orange
    return '#ef4444' // Red
  }

  // --- RESET ACTION (Good practice) ---
  function clearSites() {
    sites.value = []
  }

  return {
    sites,
    loading,
    error,
    totalSites,
    fetchSites,
    clearSites,
    getScoreColor,
  }
})
