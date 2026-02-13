<script setup lang="ts">
import { ref } from 'vue'
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import { useSiteStore } from '@/stores/siteStore'

const siteStore = useSiteStore()

// State management
const file = ref<File | null>(null)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Toast logic
const showToast = ref(false)
const toastMessage = ref('')
const isError = ref(false)

const triggerToast = (msg: string, error = false) => {
  toastMessage.value = msg
  isError.value = error
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectedFile = target.files?.[0] || null

  if (selectedFile && !selectedFile.name.endsWith('.csv')) {
    triggerToast('Please select a valid .csv file', true)
    // Reset the native input immediately so they can try again
    if (fileInputRef.value) fileInputRef.value.value = ''
    file.value = null
    return
  }
  file.value = selectedFile
}

const handleUpload = async () => {
  if (!file.value) return

  uploading.value = true

  try {
    // 1. Pass the raw File object to the store
    await siteStore.siteFileUpload(file.value)

    triggerToast('Sites imported successfully!')

    // 2. SUCCESS RESET: Clear the local file state and the DOM input
    file.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  } catch (err) {
    triggerToast('Upload failed. Please check the file format.', true)
    console.error('Error while uploading file:', err)
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="relative p-8 bg-black min-h-screen text-white flex justify-center items-start">
    <Transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="-translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showToast" class="fixed top-[15%] left-1/2 -translate-x-1/2 z-[9999]">
        <div
          class="bg-zinc-900 border px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
          :class="isError ? 'border-red-500/50 text-red-400' : 'border-blue-500/50 text-blue-400'"
        >
          <component :is="isError ? AlertCircle : CheckCircle2" :size="18" />
          <span class="text-sm font-medium tracking-wide">{{ toastMessage }}</span>
        </div>
      </div>
    </Transition>

    <div
      class="w-full max-w-2xl bg-zinc-950 border border-zinc-900 p-10 rounded-2xl mt-12 shadow-2xl"
    >
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-xl font-bold flex items-center gap-2">
          <Upload class="text-blue-500" /> Import Spatial Data
        </h2>
        <span
          class="text-[10px] bg-zinc-900 text-zinc-500 px-2 py-1 rounded border border-zinc-800 uppercase tracking-widest font-bold"
        >
          CSV Only
        </span>
      </div>

      <div
        class="group border-2 border-dashed border-zinc-800 rounded-xl p-12 flex flex-col items-center gap-4 hover:border-blue-500/40 transition-all duration-300"
      >
        <div
          class="p-4 bg-zinc-900 rounded-full group-hover:scale-110 transition-transform duration-300"
        >
          <FileText :size="40" class="text-zinc-600 group-hover:text-blue-500 transition-colors" />
        </div>

        <div class="text-center">
          <p class="text-zinc-300 font-medium">Select your site assessment file</p>
          <p class="text-zinc-500 text-xs mt-1">
            Files must contain latitude and longitude columns
          </p>
        </div>

        <input
          ref="fileInputRef"
          type="file"
          accept=".csv"
          @change="handleFileChange"
          class="hidden"
          id="fileInput"
        />

        <label
          for="fileInput"
          class="mt-2 bg-blue-600 px-8 py-2.5 rounded-lg cursor-pointer font-bold hover:bg-blue-500 transition-all text-sm shadow-lg shadow-blue-600/10 active:scale-95"
        >
          {{ file ? file.name : 'Choose File' }}
        </label>
      </div>

      <button
        @click="handleUpload"
        :disabled="!file || uploading || siteStore.isProcessing"
        class="w-full mt-8 bg-white text-black font-bold py-4 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-xl hover:bg-zinc-200 flex justify-center items-center gap-2"
      >
        <Upload v-if="!uploading" :size="18" />
        <span>{{
          uploading || siteStore.isProcessing ? 'PROCESSING UPLOAD...' : 'START IMPORT'
        }}</span>
      </button>

      <div class="mt-8 pt-6 border-t border-zinc-900 flex justify-center">
        <p class="text-[11px] text-zinc-600 tracking-wide uppercase font-semibold">
          System expects:
          <span class="text-zinc-400">site_name, lat, lon, irradiance, slope...</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles for the card hover effect */
.group:hover {
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.03) 0%, transparent 70%);
}
</style>
