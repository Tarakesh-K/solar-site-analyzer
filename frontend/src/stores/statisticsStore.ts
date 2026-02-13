import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Statistics } from '@/types/statistics'
import statisticsRepository from '@/api/statisticsRepository'

export const useStatisticsStore = defineStore('statistics', () => {
  // State
  const statistics = ref<Statistics | null>(null)
  const isLoading = ref(false)

  /**
   * Action: Fetches stats using the centralized repository.
   * Supports optional query params (like date ranges or site IDs).
   */
  const fetchStatistics = async (queryParams?: string) => {
    isLoading.value = true
    try {
      // Using the service we just refactored
      const response = await statisticsRepository.fetchStatistics(queryParams)
      
      // Axios stores the data in the .data property
      statistics.value = response.data 
    } catch (error) {
      console.error('Failed to load dashboard statistics:', error)
      // You could handle specific error states here (e.g., setting a global error ref)
    } finally {
      isLoading.value = false
    }
  }

  return { 
    statistics, 
    isLoading, 
    fetchStatistics 
  }
})