<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { useStatisticsStore } from '@/stores/statisticsStore'
import DashboardCards from '@/components/dashboard/cards/DashboardCards.vue'

// Chart.js Components
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const statsStore = useStatisticsStore()

// --- Data Fetching ---
onMounted(() => {
  statsStore.fetchStatistics()
})

// --- Computed Data ---
const kpi = computed(() => statsStore.statistics?.kpi)
const stats = computed(() => statsStore.statistics?.stats)
const allSites = computed(() => statsStore.statistics?.site_data || [])

// Factor Averages Logic
const factorItems = computed(() => {
  if (!stats.value?.factor_averages) return []
  return Object.entries(stats.value.factor_averages).map(([key, value]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    val: value,
  }))
})

// --- Chart 1: Top 10 Sites (Horizontal) ---
const topTenChartData = computed((): ChartData<'bar'> => {
  const sorted = [...allSites.value]
    .sort((a, b) => b.total_suitability_score - a.total_suitability_score)
    .slice(0, 10)

  return {
    labels: sorted.map((s) => s.site_name),
    datasets: [
      {
        label: 'Suitability Score',
        data: sorted.map((s) => s.total_suitability_score),
        backgroundColor: '#2563eb',
        borderRadius: 4,
        indexAxis: 'y' as const, // Makes it horizontal
      },
    ],
  }
})

// --- Chart 2: Top 3 Comparison ---
const comparisonChartData = computed((): ChartData<'bar'> => {
  const topThree = allSites.value.slice(0, 3)

  return {
    labels: ['Solar', 'Area', 'Grid', 'Slope', 'Infra'],
    datasets: topThree.map((site, i) => ({
      label: site.site_name,
      data: [
        site.total_suitability_score, // Using score for normalization in chart
        site.total_suitability_score * 0.9, // Mocking factor variations for visual demo
        site.total_suitability_score * 0.8,
        site.total_suitability_score * 0.95,
        site.total_suitability_score * 0.7,
      ],
      backgroundColor: i === 0 ? '#3b82f6' : i === 1 ? '#60a5fa' : '#93c5fd',
    })),
  }
})

const commonOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false, labels: { color: '#9ca3af' } },
  },
  scales: {
    y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
    x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f2937' } },
  },
}
</script>

<template>
  <div class="p-6 bg-black min-h-screen text-white">
    <header class="mb-8 border-b border-gray-800 pb-4">
      <h1 class="text-2xl font-bold tracking-tight">Solar Site Analysis Dashboard</h1>
      <p class="text-sm text-gray-500">Datasee.AI Assessment • Spatial Suitability Metrics</p>
    </header>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <DashboardCards title="Total Sites Identified" :label="kpi?.total_sites ?? 0" />
      <DashboardCards
        title="Avg Suitability Score"
        :label="`${stats?.avg_suitability_score?.toFixed(1)}%`"
      />
      <DashboardCards
        title="Total Land Area"
        :label="`${(stats?.total_land_area ?? 0).toLocaleString()} m²`"
      />
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div class="bg-gray-900 border border-gray-800 p-6 rounded-xl">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          Top 10 Recommended Sites
        </h3>
        <div class="h-80">
          <Bar :data="topTenChartData" :options="commonOptions" />
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-800 p-6 rounded-xl">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          Top 3 Factor Comparison
        </h3>
        <div class="h-80">
          <Bar
            :data="comparisonChartData"
            :options="{ ...commonOptions, plugins: { legend: { display: true } } }"
          />
        </div>
      </div>
    </div>

    <h2 class="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
      Environmental Factor Summary
    </h2>
    <section class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
      <div
        v-for="item in factorItems"
        :key="item.name"
        class="bg-gray-900/50 border border-gray-800 p-4 rounded-lg"
      >
        <p class="text-[10px] text-gray-500 font-bold uppercase mb-1">{{ item.name }}</p>
        <div class="flex items-end gap-2">
          <span class="text-xl font-mono text-white">{{ item.val.toFixed(1) }}</span>
          <span class="text-[10px] text-blue-500 mb-1 font-bold">%</span>
        </div>
        <div class="w-full bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
          <div
            class="bg-blue-600 h-full transition-all duration-1000"
            :style="{ width: `${item.val}%` }"
          ></div>
        </div>
      </div>
    </section>

    <div
      v-if="statsStore.isLoading"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div
          class="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <p class="text-blue-500 font-bold">Loading Analysis Data...</p>
      </div>
    </div>
  </div>
</template>
