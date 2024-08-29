<script lang="ts" setup>
import { FwbButton } from 'flowbite-vue'
import { trpc } from '@/trpc'
import { computed, ref } from 'vue'

export interface Meal {
  name: string
  calories: number
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  assignedDay: number | null
  completed: boolean
}

const props = defineProps<{
  meal: Meal
  planName: string
}>()

const emit = defineEmits<{
  (e: 'meal-deleted', meal: Meal): void
}>()

const meal = ref(props.meal)

const toggleCompletion = async () => {
  await trpc.mealPlanSchedule.toggleCompletionStatus.mutate({
    mealName: meal.value.name,
    assignedDay: meal.value.assignedDay,
    type: meal.value.type,
  })
  meal.value.completed = !meal.value.completed

  await trpc.fridgeContent.updateQuantity.mutate({
    mealName: meal.value.name,
    completed: meal.value.completed,
  })
}

async function deleteMeal() {
  await trpc.mealPlanSchedule.removeMealFromSchedule.mutate({
    assignedDay: meal.value.assignedDay!,
    type: meal.value.type!,
    mealName: meal.value.name,
    mealPlan: props.planName,
  })
  emit('meal-deleted', meal.value) 
}

const cardClasses = computed(() => {
  return meal.value.completed
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    : 'bg-yellow-100 text-red-800 dark:bg-red-900 dark:text-red-100'
})
</script>

<template>
  <div
    :class="[
      'mt-2 flex flex-col rounded-lg p-4 shadow-lg transition-transform duration-300 hover:scale-105',
      cardClasses,
    ]"
  >
    <h3 class="mb-2 text-xl font-bold">{{ meal.name }}</h3>
    <p class="mb-2">Calories: {{ meal.calories }}</p>

    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">
        {{ meal.completed ? 'Completed' : 'Not Completed' }}
      </span>
      <FwbButton @click="toggleCompletion">
        {{ meal.completed ? 'Uncomplete' : 'Complete' }}
      </FwbButton>
      <FwbButton @click="deleteMeal" color="red"> Delete Meal </FwbButton>
    </div>
  </div>
</template>
