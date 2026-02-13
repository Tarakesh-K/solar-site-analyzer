import apiClient from '@/services/axiosInstance'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { SiteWithScores } from '@/types/sites'

export default {
  // Fetches list of sites with optional filtering
  getSites(queryParams?: string) {
    const base = API_ENDPOINTS.SITES.BASE
    const url = queryParams ? `${base}?${queryParams}` : base
    return apiClient.get<SiteWithScores[]>(url)
  },

  // Fetches a single site by its ID
  getSiteById(siteId: number) {
    return apiClient.get<SiteWithScores>(API_ENDPOINTS.SITES.DETAILS(siteId))
  },
}
