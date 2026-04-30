<script setup lang="ts">
defineProps<{
  level: 'Error' | 'Warning'
}>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      level === 'Error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
    ]"
  >
    {{ level }}
  </span>
</template>
