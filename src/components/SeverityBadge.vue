<script setup lang="ts">
defineProps<{
  level: 'Error' | 'Warning' | 'Info' | 'Trace' | 'Exception'
}>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      level === 'Error' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
      level === 'Exception' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
      level === 'Warning' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
      level === 'Info' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    ]"
  >
    {{ level }}
  </span>
</template>
