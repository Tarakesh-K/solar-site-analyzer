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

  uploadSiteFile(payload: File) {
    // Check if your endpoint for upload is just 'base' or 'base/upload/'
    const url = base

    const formData = new FormData()
    // 'site_file' is the key your Django backend will look for in request.FILES
    formData.append('site_file', payload)

    return apiClient.post(url, formData)
  },
}
