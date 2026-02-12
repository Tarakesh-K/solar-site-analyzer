<script lang="ts" setup>
import { RouterLink, useRoute } from 'vue-router'
import { HOME_NAVBAR_CONSTANTS } from '@/constants/mapConstants'

const route = useRoute()
</script>

<template>
  <nav class="w-full h-screen bg-gray-900 text-white flex flex-col p-4 shadow-xl">
    <div class="mb-8 px-2">
      <h1 class="text-xl font-bold tracking-tight text-blue-400">Datasee.AI</h1>
      <p class="text-xs text-gray-400">Solar Suitability Portal</p>
    </div>

    <div class="flex flex-col gap-2">
      <RouterLink
        v-for="item in HOME_NAVBAR_CONSTANTS"
        :key="item.value"
        :to="item.route"
        class="px-4 py-3 rounded-lg flex items-center gap-3 group transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white"
        exact-active-class="bg-blue-600 !text-white shadow-lg shadow-blue-900/40"
      >
        <span
          class="w-1.5 h-1.5 rounded-full bg-blue-400 transition-opacity"
          :class="[route.path === item.route ? 'opacity-100' : 'opacity-0 group-hover:opacity-100']"
        ></span>

        <span class="font-medium">{{ item.value }}</span>
      </RouterLink>
    </div>

    <div class="mt-auto p-2 border-t border-gray-800">
      <p class="text-[10px] text-gray-500 uppercase tracking-widest">System Online</p>
    </div>
  </nav>
</template>
