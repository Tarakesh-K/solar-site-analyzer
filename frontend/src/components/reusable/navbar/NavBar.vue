<script lang="ts" setup>
import { RouterLink, useRoute } from 'vue-router'
import { HOME_NAVBAR_CONSTANTS } from '@/constants/mapConstants'

const route = useRoute()
</script>

<template>
  <nav class="h-screen bg-gray-900 text-white flex flex-col p-4 shadow-xl transition-all duration-300 w-20 md:w-64">
    
    <div class="mb-8 px-2 text-center md:text-left">
      <h1 class="text-xl font-bold tracking-tight text-blue-400">D<span class="hidden md:inline">atasee.AI</span></h1>
      <p class="text-[10px] text-gray-400 hidden md:block">Solar Suitability Portal</p>
    </div>

    <div class="flex flex-col gap-2">
      <RouterLink
        v-for="item in HOME_NAVBAR_CONSTANTS"
        :key="item.value"
        :to="item.route"
        class="relative px-0 md:px-4 py-3 rounded-lg flex items-center justify-center md:justify-start gap-3 group transition-all duration-200 text-gray-400 hover:bg-gray-800 hover:text-white"
        exact-active-class="bg-blue-600 !text-white shadow-lg shadow-blue-900/40"
      >
        <span
          class="absolute left-2 w-1.5 h-1.5 rounded-full bg-blue-400 transition-opacity hidden md:block"
          :class="[route.path === item.route ? 'opacity-100' : 'opacity-0 group-hover:opacity-100']"
        ></span>

        <component :is="item.icon" :size="20" class="flex-shrink-0" />

        <span class="font-medium hidden md:block">{{ item.value }}</span>

        <div class="md:hidden absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          {{ item.value }}
        </div>
      </RouterLink>
    </div>

    <div class="mt-auto p-2 border-t border-gray-800 text-center md:text-left">
      <p class="text-[10px] text-gray-500 uppercase tracking-widest">
        <span class="hidden md:inline">System Online</span>
        <span class="md:hidden">ON</span>
      </p>
    </div>
  </nav>
</template>