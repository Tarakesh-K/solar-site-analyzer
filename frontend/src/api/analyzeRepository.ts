import apiClient from '@/services/axiosInstance'
import { API_ENDPOINTS } from './endpoints'
import type { WeightRequest } from '@/types/analyze'
const base = API_ENDPOINTS.ANALYZE.BASE

export default {
  recalculateWeights(payload: WeightRequest) {
    // payload is an object that will be sent as the request body
    return apiClient.post(base, payload)
  },
}
