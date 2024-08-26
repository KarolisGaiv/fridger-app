<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { trpc } from '@/trpc'
import { FwbButton, FwbHeading } from 'flowbite-vue'
import { isLoggedIn } from '@/stores/user'
import MealCard from '@/components/MealCard.vue'
import { useRouter } from 'vue-router'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import type { Meal } from '@/components/MealCard.vue'

const planName = ref<string>('')
const plannedMeals = ref<Meal[]>([])
const hasActivePlan = ref<boolean>(false)
const router = useRouter()

// Use error handling composable for fetching data
const [fetchActiveMealPlan, activePlanError] = useErrorMessage(async () =>
  trpc.mealPlan.findActiveMealPlan.query()
)

const [fetchMealsByPlanName, mealsError] = useErrorMessage(async () => {
  return await trpc.mealPlanSchedule.find.query({ mealPlan: planName.value })
  // return await trpc.meal.findByMealPlanName.query({ planName: planName.value })
})

onMounted(async () => {
  // Fetch the active meal plan name
  const activePlanName = await fetchActiveMealPlan()
  if (activePlanName) {
    planName.value = activePlanName
    hasActivePlan.value = true

    // Fetch meals by the active meal plan name
    plannedMeals.value = await fetchMealsByPlanName()
  } else {
    hasActivePlan.value = false
  }
})

// Group meals by assigned day
const mealsByDay = computed(() => {
  const grouped: Record<number, Meal[]> = {}

  for (let day = 1; day <= 7; day++) {
    grouped[day] = plannedMeals.value.filter((meal) => meal.assignedDay === day)
  }

  return grouped
})

const goToAddMealPlan = () => {
  router.push({ name: 'AddMealPlan' })
}

const goToAddMeal = () => {
  router.push({ name: 'AddMeal' })
}
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

    <div v-if="hasActivePlan" class="mt-6">
      <FwbHeading tag="h3" class="text-3xl">Active Plan: {{ planName }}</FwbHeading>

      <!-- Loop through each day of the week -->
      <div v-for="day in 7" :key="day" class="mt-8">
        <FwbHeading tag="h4" class="text-2xl">Day {{ day }}</FwbHeading>

        <!-- Group meals by type (e.g., breakfast, lunch) -->
        <div
          v-if="mealsByDay[day].length > 0"
          class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          <div v-for="type in ['breakfast', 'lunch', 'dinner', 'snack']" :key="type">
            <h5 class="text-lg font-medium">{{ type.charAt(0).toUpperCase() + type.slice(1) }}</h5>
            <MealCard
              v-for="meal in mealsByDay[day].filter((meal) => meal.type === type)"
              :key="meal.name"
              :meal="meal"
            />
          </div>
        </div>

        <!-- Show if there are no meals planned for this day -->
        <div v-else class="mt-4 text-gray-600 dark:text-gray-400">
          No planned meals for this day.
        </div>
      </div>
    </div>

    <div v-if="activePlanError" class="mt-6">
      <AlertError :message="activePlanError" />
      <FwbButton @click="goToAddMealPlan"> Add Meal Plan </FwbButton>
    </div>

    <div v-if="mealsError" class="mt-6">
      <AlertError :message="mealsError" />
      <FwbButton @click="goToAddMeal"> Add Meals </FwbButton>
    </div>
  </div>
</template>
