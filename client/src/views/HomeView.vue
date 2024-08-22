<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { trpc } from '@/trpc'
import { FwbButton, FwbHeading } from 'flowbite-vue'
import { isLoggedIn } from '@/stores/user'
import MealCard from '@/components/MealCard.vue'

interface Meal {
  name: string
  calories: number
}

const planName = ref<string>('')
const plannedMeals = ref<Meal[]>([])
const hasActivePlan = ref<boolean>(false)

onMounted(async () => {
  // Fetch the active meal plan name
  const activePlanName = await trpc.mealPlan.findActiveMealPlan.query()
  if (activePlanName) {
    planName.value = activePlanName
    hasActivePlan.value = true

    // Fetch meals by the active meal plan name
    plannedMeals.value = await trpc.meal.findByMealPlanName.query({ planName: activePlanName })
  } else {
    hasActivePlan.value = false
  }
})
</script>

<template>
  <div class="dark:bg-gray-800">
    <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
      <div class="items-center lg:flex">
        <div class="lg:w-1/2">
          <h2 class="text-4xl font-bold text-gray-800 dark:text-gray-100">Fridger App</h2>
          <p class="mt-4 text-gray-500 dark:text-gray-400 lg:max-w-md">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nam esse deserunt perferendis
            reprehenderit nesciunt quis doloremque rerum dolor optio, facere fuga deleniti debitis
            natus aperiam sit veritatis sequi cum sunt.
          </p>
          <div class="mt-6 flex items-center gap-2">
            <FwbButton component="RouterLink" tag="router-link" href="/signup">Sign up</FwbButton>
            <FwbButton component="RouterLink" tag="router-link" color="alternative" href="/login">
              Log in
            </FwbButton>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isLoggedIn" class="text-4xl font-bold text-gray-800 dark:text-gray-100">
      <FwbHeading tag="h1" class="text-3xl">Your current meal plan details</FwbHeading>
    </div>

    <div v-if="hasActivePlan" class="mt-6 flex items-center gap-2">
      <FwbHeading tag="h3" class="text-3xl">Active Plan: {{ planName }}</FwbHeading>
    </div>

    <div v-if="hasActivePlan" class="mt-6 grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <MealCard v-for="meal in plannedMeals" :key="meal.name" :meal="meal" />
    </div>

    <div v-else class="mt-6">
      <FwbHeading tag="h3" class="text-3xl">You do not have an active meal plan.</FwbHeading>
    </div>
  </div>
</template>
