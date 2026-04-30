<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const isDragging = ref(false)

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) validateAndEmit(file)
}

function handleFileInput(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) validateAndEmit(file)
}

function validateAndEmit(file: File) {
  if (!file.name.endsWith('.zip')) {
    return
  }
  emit('fileSelected', file)
}
</script>

<template>
  <div class="max-w-xl mx-auto">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analyze PowerToys Logs</h2>
      <p class="text-gray-600 dark:text-gray-400">
        Upload a PowerToys diagnostic zip file to analyze Command Palette logs for errors and warnings.
      </p>
    </div>

    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer',
        isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800',
        isLoading ? 'opacity-60 pointer-events-none' : ''
      ]"
      @click="($refs.fileInput as HTMLInputElement)?.click()"
    >
      <div v-if="isLoading" class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-gray-600 dark:text-gray-300 font-medium">Analyzing logs...</p>
      </div>
      <div v-else class="flex flex-col items-center gap-3">
        <div class="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <svg class="w-7 h-7 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p class="text-gray-700 dark:text-gray-200 font-medium">Drop your PowerToys zip file here</p>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">or click to browse</p>
        </div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".zip"
        class="hidden"
        @change="handleFileInput"
      />
    </div>

    <div v-if="error" class="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-700 dark:text-red-400 text-sm">{{ error }}</p>
    </div>
  </div>
</template>
