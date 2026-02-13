import axios from 'axios'
import type { SiteWithScores } from '@/types/sites'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export default {
  // Centralized API logic
  getSites(queryParams?: string) {
    const url = queryParams ? `/sites/?${queryParams}` : '/sites/'
    return apiClient.get<SiteWithScores[]>(url)
  },

  getSiteById(site_id: number) {
    return apiClient.get<SiteWithScores>(`/sites/${site_id}`)
  },

  recalculateScores(weights: object) {
    return apiClient.post('/analyze', { weights })
  },
}
