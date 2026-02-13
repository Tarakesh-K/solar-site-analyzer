import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Statistics } from '@/types/statistics'

export const useStatisticsStore = defineStore('statistics', () => {
  // State: This holds the raw data from your API
  const statistics = ref<Statistics | null>(null)
  const isLoading = ref(false)

  // Action: The fetcher
  const fetchStatistics = async () => {
    isLoading.value = true
    try {
      // Replace with your actual axios/fetch call
      const response = await fetch('')
      const data: Statistics = await response.json()
      statistics.value = data
    } finally {
      isLoading.value = false
    }
  }

  return { statistics, isLoading, fetchStatistics }
})