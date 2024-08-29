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

const [fetchActiveMealPlan, activePlanError] = useErrorMessage(async () =>
  trpc.mealPlan.findActiveMealPlan.query()
)

const [fetchMealsByPlanName, mealsError] = useErrorMessage(async () => {
  return await trpc.mealPlanSchedule.find.query({ mealPlan: planName.value })
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

const handleMealDeleted = (deletedMeal: Meal) => {
  plannedMeals.value = plannedMeals.value.filter(meal => meal.name !== deletedMeal.name)
}
</script>

<template>
  <div class="dark:bg-gray-800">
    <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
      <div class="items-center lg:flex">
        <div class="lg:w-1/2">
          <h2 class="text-4xl font-bold text-gray-800 dark:text-gray-100">Fridger App</h2>
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
      <FwbHeading tag="h1" class="text-3xl">Current Meal Plan Details</FwbHeading>
    </div>

    <div v-if="hasActivePlan" class="mt-6">
      <FwbHeading tag="h3" class="text-3xl text-green-400">{{ planName }}</FwbHeading>

      <!-- Loop through each day of the week -->
      <div v-for="day in 7" :key="day" class="mt-8">
        <FwbHeading
          tag="h4"
          class="mb-4 border-b border-gray-300 pb-2 text-2xl dark:border-gray-600"
          >Day {{ day }}</FwbHeading
        >

        <!-- Group meals by type (e.g., breakfast, lunch) -->
        <div
          v-if="mealsByDay[day].length > 0"
          class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          <template v-for="type in ['breakfast', 'lunch', 'dinner', 'snack']" :key="type">
            <!-- Check if there are meals of the current type for the current day -->
            <div v-if="mealsByDay[day].some((meal) => meal.type === type)" class="">
              <h5
                class="mb-4 border-b border-gray-300 pb-2 text-lg font-medium dark:border-gray-600"
              >
                {{ type.charAt(0).toUpperCase() + type.slice(1) }}
              </h5>
              <MealCard
                v-for="meal in mealsByDay[day].filter((meal) => meal.type === type)"
                :key="meal.name"
                :meal="meal"
                :planName="planName"
                @meal-deleted="handleMealDeleted"
              />
            </div>
          </template>
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
