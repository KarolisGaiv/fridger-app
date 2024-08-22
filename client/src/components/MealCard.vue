<script lang="ts" setup>
import { defineProps } from 'vue'

const props = defineProps<{
  meal: {
    name: string
    calories: number
  }
}>()
</script>

<template>
  <div class="rounded-lg bg-white p-4 shadow-md dark:bg-gray-700">
    <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">{{ meal.name }}</h3>
    <p class="text-gray-600 dark:text-gray-300">Calories: {{ meal.calories }}</p>
  </div>
</template>
