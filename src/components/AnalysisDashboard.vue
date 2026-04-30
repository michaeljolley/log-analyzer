<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AnalysisResult, LogArea } from '@/types'
import SeverityBadge from './SeverityBadge.vue'
import IssueDetail from './IssueDetail.vue'

const props = defineProps<{
  result: AnalysisResult
}>()

type FilterLevel = 'all' | 'Error' | 'Warning' | 'Exception'
const filterLevel = ref<FilterLevel>('all')
const filterArea = ref<'all' | LogArea>('all')
const expandedIssueId = ref<string | null>(null)

const filteredIssues = computed(() => {
  return props.result.issues.filter(issue => {
    if (filterLevel.value === 'Exception') {
      if (!issue.message.toLowerCase().includes('exception')) return false
    } else if (filterLevel.value !== 'all' && issue.level !== filterLevel.value) {
      return false
    }
    if (filterArea.value !== 'all' && issue.logArea !== filterArea.value) return false
    return true
  })
})

function setFilter(level: FilterLevel) {
  filterLevel.value = filterLevel.value === level ? 'all' : level
}

function toggleExpanded(id: string) {
  expandedIssueId.value = expandedIssueId.value === id ? null : id
}

const areaLabel: Record<LogArea, string> = {
  CmdPal: 'Command Palette',
  ModuleInterface: 'Module Interface',
  PowerToysExtension: 'PowerToys Extension',
}
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Log Entries</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ result.summary.totalEntries.toLocaleString() }}</p>
      </div>
      <div
        @click="setFilter('Error')"
        :class="[
          'rounded-xl border p-5 shadow-sm cursor-pointer transition-all',
          filterLevel === 'Error'
            ? 'bg-red-50 dark:bg-red-950 border-red-400 dark:border-red-600 ring-2 ring-red-300 dark:ring-red-700'
            : 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-600'
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
            : 'bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-900 hover:border-yellow-400 dark:hover:border-yellow-600'
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
            : 'bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-600'
        ]"
      >
        <p class="text-sm text-purple-600 dark:text-purple-400 font-medium">Exceptions</p>
        <p class="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">{{ result.summary.exceptionCount }}</p>
      </div>
    </div>

    <!-- Issues by Area -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div
        v-for="(stats, area) in result.summary.byArea"
        :key="area"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
      >
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ areaLabel[area as LogArea] }}</p>
        <div class="flex gap-4 text-sm">
          <span class="text-red-600 dark:text-red-400">{{ stats.errors }} errors</span>
          <span class="text-yellow-600 dark:text-yellow-400">{{ stats.warnings }} warnings</span>
        </div>
      </div>
    </div>

    <!-- No issues state -->
    <div v-if="result.issues.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="text-lg font-medium text-gray-900 dark:text-gray-100">No issues found!</p>
      <p class="text-gray-500 dark:text-gray-400 mt-1">The logs look clean — no errors or warnings detected.</p>
    </div>

    <!-- Issue List -->
    <div v-else>
      <!-- Filters -->
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
          <option value="all">All Areas</option>
          <option value="CmdPal">Command Palette</option>
          <option value="ModuleInterface">Module Interface</option>
          <option value="PowerToysExtension">PowerToys Extension</option>
        </select>
        <span class="text-sm text-gray-500 dark:text-gray-400 self-center">
          {{ filteredIssues.length }} issue{{ filteredIssues.length !== 1 ? 's' : '' }}
        </span>
        <button
          v-if="filterLevel !== 'all' || filterArea !== 'all'"
          @click="filterLevel = 'all'; filterArea = 'all'"
          class="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          Clear filters
        </button>
      </div>

      <!-- Issues -->
      <div class="space-y-3">
        <div
          v-for="issue in filteredIssues"
          :key="issue.id"
          class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div
            @click="toggleExpanded(issue.id)"
            class="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <SeverityBadge v-if="issue.level === 'Error' || issue.level === 'Warning'" :level="issue.level" />
                  <span class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{{ areaLabel[issue.logArea] }}</span>
                  <span v-if="issue.occurrences > 1" class="text-xs text-gray-500 dark:text-gray-400">
                    × {{ issue.occurrences }}
                  </span>
                </div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  <span v-if="issue.sourceFile" class="text-gray-500 dark:text-gray-400">{{ issue.sourceFile }}::</span>{{ issue.method }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">{{ issue.message }}</p>
              </div>
              <svg
                :class="['w-5 h-5 text-gray-400 transition-transform shrink-0', expandedIssueId === issue.id ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <IssueDetail v-if="expandedIssueId === issue.id" :issue="issue" />
        </div>
      </div>
    </div>
  </div>
</template>
