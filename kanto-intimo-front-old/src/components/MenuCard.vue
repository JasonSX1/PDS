<template>
  <div
    class="bg-white border rounded-lg px-4 py-6 shadow hover:shadow-md transition cursor-pointer flex items-center justify-start gap-3 min-w-[150px] max-w-full"
  >
    <div class="text-3xl flex-shrink-0">{{ icon }}</div>
    <div class="text-lg font-bold text-gray-800 whitespace-nowrap">{{ label }}</div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  icon: string
  label: string
}>()
</script>
