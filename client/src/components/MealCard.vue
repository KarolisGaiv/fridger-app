<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue'
import { trpc } from '@/trpc'
import { ref } from 'vue'

export interface Meal {
  name: string
  calories: number
  type: string | null
  assignedDay: number | null
  completed: boolean
}

const props = defineProps<{
  meal: Meal
}>()

const meal = ref(props.meal)

const toggleCompletion = async () => {
  await trpc.meal.toggleCompletionStatus.mutate({ name: meal.value.name })

  meal.value.completed = !meal.value.completed

  await trpc.fridgeContent.updateQuantity.mutate({
    mealName: meal.value.name,
    completed: meal.value.completed,
  })
}
</script>

<template>
  <div class="rounded-lg bg-white p-4 shadow-md dark:bg-gray-700">
    <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-100">{{ meal.name }}</h3>
    <p class="text-gray-600 dark:text-gray-300">Calories: {{ meal.calories }}</p>
    <FwbButton @click="toggleCompletion">{{
      meal.completed ? 'Uncomplete' : 'Complete'
    }}</FwbButton>
  </div>
</template>
