import { onMounted } from 'vue'
import { useSiteStore } from '@/stores/siteStore'
import { storeToRefs } from 'pinia'

export function useMapLogic() {
  const siteStore = useSiteStore()

  const { sites, loading, error } = storeToRefs(siteStore)

  onMounted(() => {
    siteStore.sites.length === 0 && siteStore.fetchSites()
  })

  return {
    sites,
    loading,
    error,
    getScoreColor: siteStore.getScoreColor, // Pass the function through
    mapFilters: siteStore.mapFilters,
    setMapFilterValue: siteStore.setMapFilterValue,
    setActivePanels: siteStore.setActivePanels,
    fetchSites: siteStore.fetchSites,
  }
}
