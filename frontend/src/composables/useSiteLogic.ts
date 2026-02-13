import { onMounted } from 'vue'
import { useSiteStore } from '@/stores/siteStore'
import { storeToRefs } from 'pinia'

export function useMapLogic() {
  const siteStore = useSiteStore()

  const { sites, loading, error } = storeToRefs(siteStore)

  const initMapData = async () => {
    if (sites.value.length === 0) {
      await siteStore.fetchSites()
    }
  }

  onMounted(() => {
    initMapData()
  })

  return {
    sites,
    loading,
    error,
    getScoreColor: siteStore.getScoreColor, // Pass the function through
    refresh: siteStore.fetchSites,
    mapFilters: siteStore.mapFilters,
    setMapFilterValue: siteStore.setMapFilterValue,
    setActivePanels: siteStore.setActivePanels,
    fetchSites: siteStore.fetchSites,
  }
}
