<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AnalysisResult, LogArea } from '@/types'
import SeverityBadge from './SeverityBadge.vue'
import IssueDetail from './IssueDetail.vue'

const props = defineProps<{
  result: AnalysisResult
}>()

const filterLevel = ref<'all' | 'Error' | 'Warning'>('all')
const filterArea = ref<'all' | LogArea>('all')
const expandedIssueId = ref<string | null>(null)

const filteredIssues = computed(() => {
  return props.result.issues.filter(issue => {
    if (filterLevel.value !== 'all' && issue.level !== filterLevel.value) return false
    if (filterArea.value !== 'all' && issue.logArea !== filterArea.value) return false
    return true
  })
})

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
      <div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <p class="text-sm text-gray-500 font-medium">Total Log Entries</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ result.summary.totalEntries.toLocaleString() }}</p>
      </div>
      <div class="bg-white rounded-xl border border-red-200 p-5 shadow-sm">
        <p class="text-sm text-red-600 font-medium">Errors</p>
        <p class="text-2xl font-bold text-red-700 mt-1">{{ result.summary.errorCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-yellow-200 p-5 shadow-sm">
        <p class="text-sm text-yellow-600 font-medium">Warnings</p>
        <p class="text-2xl font-bold text-yellow-700 mt-1">{{ result.summary.warningCount }}</p>
      </div>
      <div class="bg-white rounded-xl border border-purple-200 p-5 shadow-sm">
        <p class="text-sm text-purple-600 font-medium">Exceptions</p>
        <p class="text-2xl font-bold text-purple-700 mt-1">{{ result.summary.exceptionCount }}</p>
      </div>
    </div>

    <!-- Issues by Area -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div
        v-for="(stats, area) in result.summary.byArea"
        :key="area"
        class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
      >
        <p class="text-sm font-medium text-gray-700 mb-2">{{ areaLabel[area as LogArea] }}</p>
        <div class="flex gap-4 text-sm">
          <span class="text-red-600">{{ stats.errors }} errors</span>
          <span class="text-yellow-600">{{ stats.warnings }} warnings</span>
        </div>
      </div>
    </div>

    <!-- No issues state -->
    <div v-if="result.issues.length === 0" class="text-center py-12 bg-white rounded-xl border border-gray-200">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="text-lg font-medium text-gray-900">No issues found!</p>
      <p class="text-gray-500 mt-1">The logs look clean — no errors or warnings detected.</p>
    </div>

    <!-- Issue List -->
    <div v-else>
      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-4">
        <select
          v-model="filterLevel"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="Error">Errors only</option>
          <option value="Warning">Warnings only</option>
        </select>
        <select
          v-model="filterArea"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Areas</option>
          <option value="CmdPal">Command Palette</option>
          <option value="ModuleInterface">Module Interface</option>
          <option value="PowerToysExtension">PowerToys Extension</option>
        </select>
        <span class="text-sm text-gray-500 self-center">
          {{ filteredIssues.length }} issue{{ filteredIssues.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Issues -->
      <div class="space-y-3">
        <div
          v-for="issue in filteredIssues"
          :key="issue.id"
          class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div
            @click="toggleExpanded(issue.id)"
            class="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <SeverityBadge v-if="issue.level === 'Error' || issue.level === 'Warning'" :level="issue.level" />
                  <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{{ areaLabel[issue.logArea] }}</span>
                  <span v-if="issue.occurrences > 1" class="text-xs text-gray-500">
                    × {{ issue.occurrences }}
                  </span>
                </div>
                <p class="text-sm font-medium text-gray-900 truncate">
                  <span v-if="issue.sourceFile" class="text-gray-500">{{ issue.sourceFile }}::</span>{{ issue.method }}
                </p>
                <p class="text-sm text-gray-600 mt-0.5 truncate">{{ issue.message }}</p>
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
