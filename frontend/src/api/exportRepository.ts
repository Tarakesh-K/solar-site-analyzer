import apiClient from '@/services/axiosInstance'
import { API_ENDPOINTS } from '@/api/endpoints'

const base = API_ENDPOINTS.ENDPOINTS.BASE

export default {
  exportSitesAsCsv() {
    // We explicitly tell Axios we expect a binary file
    return apiClient.get(base, {
      responseType: 'blob',
    })
  },
}
