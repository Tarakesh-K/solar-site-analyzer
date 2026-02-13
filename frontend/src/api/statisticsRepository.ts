import apiClient from '@/services/axiosInstance'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { Statistics } from '@/types/statistics'

export default {
  fetchStatistics(queryParams?: string) {
    const base = API_ENDPOINTS.STATISTICS.BASE
    const url = queryParams ? `${base}?${queryParams}` : base
    return apiClient.get<Statistics>(url)
  }
}