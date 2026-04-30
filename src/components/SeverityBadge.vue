<script setup lang="ts">
defineProps<{
  level: 'Error' | 'Warning' | 'Exception'
}>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      level === 'Error' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
      level === 'Exception' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
      'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    ]"
  >
    {{ level }}
  </span>
</template>
