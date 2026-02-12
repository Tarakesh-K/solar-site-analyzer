<script lang="ts" setup>
import { ref } from 'vue'
import { LMap, LTileLayer, LCircleMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
// Import the initialization logic
import { useMapLogic } from '@/composables/useSiteLogic'

// Initialize everything here
const { sites, getScoreColor } = useMapLogic()

const zoom = ref(9)
const center = ref<[number, number]>([10.94, 77.2])
const tileUrl = import.meta.env.VITE_SITE_MAP_TILE_URL
const attribution = import.meta.env.VITE_SITE_MAP_ATTRIBUTION
</script>

<template>
  <div class="h-screen p-4 relative">
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
        :radius="6"
        :color="getScoreColor(site.total_suitability_score)"
        :fill-color="getScoreColor(site.total_suitability_score)"
        :fill-opacity="0.8"
      >
        <l-popup>
          <div class="space-y-1">
            <h3 class="font-bold" :style="{ color: getScoreColor(site.total_suitability_score) }">
              {{ site.site_name }}
            </h3>
            <p>
              Suitability:
              <strong>{{ site.total_suitability_score }}%</strong>
            </p>
            <p>
              Latitude:
              <strong>{{ site.latitude }}</strong>
            </p>
            <p>
              Longitude:
              <strong>{{ site.longitude }}</strong>
            </p>
          </div>
        </l-popup>
      </l-circle-marker>
    </l-map>
  </div>
</template>
