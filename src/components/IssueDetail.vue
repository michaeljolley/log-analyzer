<script setup lang="ts">
import type { LogIssue } from '@/types'

defineProps<{
  issue: LogIssue
}>()
</script>

<template>
  <div class="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 px-4 py-4">
    <div class="mb-3">
      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {{ issue.occurrences }} occurrence{{ issue.occurrences !== 1 ? 's' : '' }}
      </p>
    </div>
    <div class="space-y-2 max-h-80 overflow-y-auto">
      <div
        v-for="(entry, idx) in issue.entries.slice(0, 10)"
        :key="idx"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
      >
        <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span class="font-mono">{{ entry.timestamp }}</span>
          <span v-if="entry.sourceFile">{{ entry.sourceFile }}::{{ entry.method }}</span>
        </div>
        <pre class="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">{{ entry.message }}</pre>
      </div>
      <p v-if="issue.entries.length > 10" class="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
        ... and {{ issue.entries.length - 10 }} more occurrences
      </p>
    </div>
  </div>
</template>
