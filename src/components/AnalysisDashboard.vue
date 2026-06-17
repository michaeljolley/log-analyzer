<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AnalysisResult } from '@/types'
import SeverityBadge from './SeverityBadge.vue'

const props = defineProps<{
  result: AnalysisResult
}>()

type FilterLevel = 'all' | 'Error' | 'Warning' | 'Exception'
const filterLevel = ref<FilterLevel>('all')
const filterArea = ref<'all' | string>('all')
const expandedIndex = ref<number | null>(null)

const modules = computed(() => {
  return Array.from(new Set(props.result.files.map((file) => file.area))).sort((a, b) => a.localeCompare(b))
})

const filteredEntries = computed(() => {
  return props.result.entries.filter((entry) => {
    if (filterLevel.value === 'Exception') {
      if (!entry.message.toLowerCase().includes('exception')) return false
    } else if (filterLevel.value !== 'all' && entry.level !== filterLevel.value) {
      return false
    }
    if (filterArea.value !== 'all' && entry.logArea !== filterArea.value) return false
    return true
  })
})

function setFilter(level: FilterLevel) {
  filterLevel.value = filterLevel.value === level ? 'all' : level
}

function clearFilters() {
  filterLevel.value = 'all'
  filterArea.value = 'all'
}

function toggleExpanded(idx: number) {
  expandedIndex.value = expandedIndex.value === idx ? null : idx
}

function formatModuleLabel(area: string) {
  return area
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
</script>

<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        @click="clearFilters"
        :class="[
          'rounded-xl border p-5 shadow-sm cursor-pointer transition-all',
          filterLevel === 'all'
            ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ring-2 ring-blue-300 dark:ring-blue-700'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
        ]"
      >
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Log Entries</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ result.summary.totalEntries.toLocaleString() }}</p>
      </div>
      <div
        @click="setFilter('Error')"
        :class="[
          'rounded-xl border p-5 shadow-sm cursor-pointer transition-all',
          filterLevel === 'Error'
            ? 'bg-red-50 dark:bg-red-950 border-red-400 dark:border-red-600 ring-2 ring-red-300 dark:ring-red-700'
            : 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-400 dark:hover:border-red-600'
        ]"
      >
        <p class="text-sm text-red-600 dark:text-red-400 font-medium">Errors</p>
        <p class="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{{ result.summary.errorCount }}</p>
      </div>
      <div
        @click="setFilter('Warning')"
        :class="[
          'rounded-xl border p-5 shadow-sm cursor-pointer transition-all',
          filterLevel === 'Warning'
            ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-400 dark:border-yellow-600 ring-2 ring-yellow-300 dark:ring-yellow-700'
            : 'bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-900 hover:bg-yellow-50 dark:hover:bg-yellow-950 hover:border-yellow-400 dark:hover:border-yellow-600'
        ]"
      >
        <p class="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Warnings</p>
        <p class="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">{{ result.summary.warningCount }}</p>
      </div>
      <div
        @click="setFilter('Exception')"
        :class="[
          'rounded-xl border p-5 shadow-sm cursor-pointer transition-all',
          filterLevel === 'Exception'
            ? 'bg-purple-50 dark:bg-purple-950 border-purple-400 dark:border-purple-600 ring-2 ring-purple-300 dark:ring-purple-700'
            : 'bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-900 hover:bg-purple-50 dark:hover:bg-purple-950 hover:border-purple-400 dark:hover:border-red-600'
        ]"
      >
        <p class="text-sm text-purple-600 dark:text-purple-400 font-medium">Exceptions</p>
        <p class="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{{ result.summary.exceptionCount }}</p>
      </div>
    </div>

    <!-- No issues state -->
    <div v-if="result.entries.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="text-lg font-medium text-gray-900 dark:text-gray-100">No issues found!</p>
      <p class="text-gray-500 dark:text-gray-400 mt-1">The logs look clean — no errors or warnings detected.</p>
    </div>

    <div v-else>
      <div class="flex flex-wrap gap-3 mb-4">
        <select
          v-model="filterLevel"
          class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="Error">Errors only</option>
          <option value="Warning">Warnings only</option>
          <option value="Exception">Exceptions only</option>
        </select>
        <select
          v-model="filterArea"
          class="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Modules</option>
          <option v-for="module in modules" :key="module" :value="module">{{ formatModuleLabel(module) }}</option>
        </select>
        <span class="text-sm text-gray-500 dark:text-gray-400 self-center">
          {{ filteredEntries.length }} entr{{ filteredEntries.length !== 1 ? 'ies' : 'y' }}
        </span>
        <button
          v-if="filterLevel !== 'all' || filterArea !== 'all'"
          @click="clearFilters"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Clear filters
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="(entry, idx) in filteredEntries"
          :key="idx"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div
            @click="toggleExpanded(idx)"
            class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <SeverityBadge v-if="entry.level === 'Error' || entry.level === 'Warning'" :level="entry.message.toLowerCase().includes('exception') ? 'Exception' : entry.level" />
                  <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{{ formatModuleLabel(entry.logArea) }}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500 font-mono">{{ entry.logDate }} {{ entry.timestamp }}</span>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  <span v-if="entry.sourceFile" class="text-gray-500 dark:text-gray-400">{{ entry.sourceFile }}::</span>{{ entry.method }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">{{ entry.message }}</p>
              </div>
              <svg
                :class="['w-5 h-5 text-gray-400 transition-transform shrink-0', expandedIndex === idx ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div v-if="expandedIndex === idx" class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-4">
            <pre class="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">{{ entry.fullText }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
