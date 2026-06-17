<script setup lang="ts">
import type { LogEntry } from '@/types'

const props = defineProps<{
  entries: LogEntry[]
}>()

function formatModuleLabel(area: string) {
  return area
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function severityClasses(level: LogEntry['level']) {
  switch (level) {
    case 'Error':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-100 dark:border-red-800'
    case 'Warning':
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800'
    case 'Info':
      return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-100 dark:border-sky-800'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
  }
}

function dotClasses(level: LogEntry['level']) {
  switch (level) {
    case 'Error':
      return 'bg-red-500 dark:bg-red-400'
    case 'Warning':
      return 'bg-amber-400 dark:bg-amber-300'
    case 'Info':
      return 'bg-sky-400 dark:bg-sky-300'
    default:
      return 'bg-gray-400 dark:bg-gray-500'
  }
}
</script>

<template>
  <div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
    <div class="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Chronological timeline</h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">All parsed log entries, including Info and Trace, in order</p>
      </div>
      <span class="text-xs text-gray-500 dark:text-gray-400">{{ props.entries.length }} entr{{ props.entries.length === 1 ? 'y' : 'ies' }}</span>
    </div>

    <div class="max-h-[640px] overflow-y-auto p-4 sm:p-6">
      <div v-if="props.entries.length === 0" class="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-sm text-gray-500 dark:text-gray-400">
        No log entries match the selected module filter.
      </div>

      <ol v-else class="relative border-l border-gray-200 dark:border-gray-700 ml-2">
        <li v-for="entry in props.entries" :key="`${entry.logDate}-${entry.timestamp}-${entry.sourceFile}-${entry.method}-${entry.message}`" class="mb-6 ml-5">
          <span
            class="absolute -left-[0.42rem] mt-1.5 h-3 w-3 rounded-full border border-white dark:border-gray-800 shadow-sm"
            :class="dotClasses(entry.level)"
          />
          <div class="grid gap-4 lg:grid-cols-[160px_1fr]">
            <div class="text-sm text-gray-500 dark:text-gray-400 lg:pt-1">
              <p class="font-mono text-xs sm:text-sm">{{ entry.logDate }}</p>
              <p class="font-mono text-xs sm:text-sm">{{ entry.timestamp }}</p>
            </div>

            <article class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/70 p-4 shadow-sm">
              <div class="flex flex-wrap items-center gap-2">
                <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold" :class="severityClasses(entry.level)">
                  {{ entry.level }}
                </span>
                <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-300">
                  {{ formatModuleLabel(entry.logArea) }}
                </span>
                <span v-if="entry.sourceFile" class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-300">
                  {{ entry.sourceFile }}
                </span>
              </div>

              <p class="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ entry.method || 'Unknown method' }}
              </p>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {{ entry.message }}
              </p>
            </article>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>
