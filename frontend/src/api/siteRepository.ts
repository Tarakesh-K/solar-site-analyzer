import apiClient from '@/services/axiosInstance'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { SiteWithScores } from '@/types/sites'

const base = API_ENDPOINTS.SITES.BASE

export default {
  // Fetches list of sites with optional filtering
  getSites(queryParams?: string) {
    const url = queryParams ? `${base}?${queryParams}` : base
    return apiClient.get<SiteWithScores[]>(url)
  },

  // Fetches a single site by its ID
  getSiteById(siteId: number) {
    return apiClient.get<SiteWithScores>(API_ENDPOINTS.SITES.DETAILS(siteId))
  },
}
