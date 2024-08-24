<script lang="ts" setup>

export interface Meal {
  name: string
  calories: number
  type: string | null
  assignedDay: number | null
}

const props = defineProps<{
  meal: Meal
}>()

const meal = props.meal
</script>

<template>
  <div class="rounded-lg bg-white p-4 shadow-md dark:bg-gray-700">
    <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">{{ meal.name }}</h3>
    <p class="text-gray-600 dark:text-gray-300">Calories: {{ meal.calories }}</p>
  </div>
</template>
