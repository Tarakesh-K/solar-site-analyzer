<script lang="ts" setup>
import { ref } from 'vue'
import { LMap, LTileLayer, LCircleMarker, LTooltip } from '@vue-leaflet/vue-leaflet'
import { X, Sun, Maximize, Zap, Mountain, Building2 } from 'lucide-vue-next'
import 'leaflet/dist/leaflet.css'
import { useMapLogic } from '@/composables/useSiteLogic'
import type { SiteWithScores } from '@/types/sites'

const { sites, getScoreColor } = useMapLogic()

const zoom = ref(9)
const center = ref<[number, number]>([10.94, 77.2])
const tileUrl = import.meta.env.VITE_SITE_MAP_TILE_URL
const attribution = import.meta.env.VITE_SITE_MAP_ATTRIBUTION

// Selection State
const selectedSite = ref<SiteWithScores | null>(null)

const handleSiteSelect = (site: SiteWithScores) => {
  selectedSite.value = site
}
</script>

<template>
  <div class="flex h-screen bg-black overflow-hidden p-4 gap-4">
    <div class="flex-grow relative rounded-2xl overflow-hidden border border-zinc-900">
      <l-map
        v-model:zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        style="height: 100%; width: 100%"
      >
        <l-tile-layer :url="tileUrl" :attribution="attribution" />

        <l-circle-marker
          v-for="site in sites"
          :key="site.site_id"
          :lat-lng="[site.latitude, site.longitude]"
          :radius="selectedSite?.site_id === site.site_id ? 10 : 7"
          :color="'white'"
          :weight="selectedSite?.site_id === site.site_id ? 3 : 1"
          :fill-color="getScoreColor(site.total_suitability_score)"
          :fill-opacity="0.9"
          @click="handleSiteSelect(site)"
        >
          <l-tooltip>{{ site.site_name }}</l-tooltip>
        </l-circle-marker>
      </l-map>
    </div>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div 
        v-if="selectedSite" 
        class="w-96 bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-2xl flex flex-col h-full"
      >
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-xl font-bold text-white">{{ selectedSite.site_name }}</h2>
            <p class="text-[10px] text-zinc-500 font-mono mt-1">ID: {{ selectedSite.site_id }}</p>
          </div>
          <button @click="selectedSite = null" class="text-zinc-500 hover:text-white transition-colors">
            <X :size="20" />
          </button>
        </div>

        <div class="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col items-center mb-8">
          <div 
            class="text-5xl font-black mb-1"
            :style="{ color: getScoreColor(selectedSite.total_suitability_score) }"
          >
            {{ selectedSite.total_suitability_score }}%
          </div>
          <span class="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">Suitability Score</span>
        </div>

        <div class="space-y-6 flex-grow overflow-y-auto pr-2">
          <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2">Factor Breakdown</h3>
          
          <div v-for="(val, key) in { 
            'Solar': { icon: Sun, score: selectedSite.solar_irradiance_score, raw: selectedSite.solar_irradiance_kwh },
            'Area': { icon: Maximize, score: selectedSite.area_score, raw: selectedSite.area_sqm },
            'Grid': { icon: Zap, score: selectedSite.grid_distance_score, raw: selectedSite.grid_distance_km },
            'Slope': { icon: Mountain, score: selectedSite.slope_score, raw: selectedSite.slope_degrees },
            'Infrastructure': { icon: Building2, score: selectedSite.infrastructure_score, raw: selectedSite.road_distance_km }
          }" :key="key" class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="flex items-center gap-2 text-zinc-300">
                <component :is="val.icon" :size="14" class="text-zinc-500" />
                {{ key }}
              </span>
              <span class="font-mono text-zinc-400">{{ val.score }}%</span>
            </div>
            <div class="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div 
                class="h-full bg-blue-500 transition-all duration-1000" 
                :style="{ width: `${val.score}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-zinc-900">
          <div class="flex justify-between text-[10px] text-zinc-600 font-mono">
            <span>LAT: {{ selectedSite.latitude }}</span>
            <span>LON: {{ selectedSite.longitude }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>