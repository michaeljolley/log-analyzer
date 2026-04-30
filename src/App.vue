<script setup lang="ts">
import { ref } from 'vue'
import FileUpload from './components/FileUpload.vue'
import AnalysisDashboard from './components/AnalysisDashboard.vue'
import { useZipExtractor } from './composables/useZipExtractor'
import { useAnalysis } from './composables/useAnalysis'
import type { AnalysisResult } from './types'

const { isExtracting, error: extractError, extractZip } = useZipExtractor()
const { analyze } = useAnalysis()

const isAnalyzing = ref(false)
const result = ref<AnalysisResult | null>(null)
const isDark = ref(document.documentElement.classList.contains('dark'))

function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

async function handleFileSelected(file: File) {
  result.value = null
  isAnalyzing.value = true

  try {
    const logFiles = await extractZip(file)
    if (logFiles.length === 0 && !extractError.value) {
      extractError.value = 'No CmdPal log files found in the zip archive.'
      return
    }
    if (logFiles.length > 0) {
      result.value = analyze(logFiles)
    }
  } finally {
    isAnalyzing.value = false
  }
}

function handleReset() {
  result.value = null
  extractError.value = null
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">CmdPal Log Analyzer</h1>
        </div>
        <div class="flex items-center gap-3">
          <button
            v-if="result"
            @click="handleReset"
            class="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            ← Analyze another file
          </button>
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8">
      <div v-if="!result">
        <FileUpload
          :is-loading="isExtracting || isAnalyzing"
          :error="extractError"
          @file-selected="handleFileSelected"
        />
      </div>
      <div v-else>
        <AnalysisDashboard :result="result" />
      </div>
    </main>
  </div>
</template>
