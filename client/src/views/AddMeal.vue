<script setup lang="ts">
import { trpc } from '@/trpc'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput, FwbSelect, FwbCheckbox } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'

const router = useRouter()
const showExistingMeals = ref(false)
const activePlan = ref('')
const availablePlans = ref<{ value: string; name: string }[]>([])
const existingMeals = ref<{ value: string; name: string }[]>([])

// State for Meal form
const mealForm = ref({
  name: '',
  calories: '0',
  mealPlan: '',
  assignedDay: '1',
  type: '',
  selectedMeal: '', // Added to hold the selected existing meal ID
})

const planDays = [
  { value: '1', name: 'Day 1' },
  { value: '2', name: 'Day 2' },
  { value: '3', name: 'Day 3' },
  { value: '4', name: 'Day 4' },
  { value: '5', name: 'Day 5' },
  { value: '6', name: 'Day 6' },
  { value: '7', name: 'Day 7' },
  { value: '', name: 'No assigned day' },
]

const mealTypes = [
  { value: 'breakfast', name: 'Breakfast' },
  { value: 'lunch', name: 'Lunch' },
  { value: 'dinner', name: 'Dinner' },
  { value: 'snack', name: 'Snack' },
]

const successMessage = ref<string | null>(null)
const showOptions = ref(false) // Show options after meal is added

// Initialize data when component is mounted
onMounted(async () => {
  activePlan.value = await trpc.mealPlan.findActiveMealPlan.query()
  const plans = await trpc.mealPlan.findByUserId.query()

  availablePlans.value = [
    { value: '', name: 'No Meal Plan' },
    ...plans.map((plan) => ({
      value: plan.planName,
      name: plan.planName,
    })),
  ]

  // Fetch existing meals for selection
  const meals = await trpc.meal.findAll.query()
  existingMeals.value = meals.map(meal => ({
    name: meal.name,
    value: meal.name
  }))

  // Set default meal plan to active one, or "No Meal Plan" if no active plan
  mealForm.value.mealPlan = activePlan.value ? activePlan.value : ''
})

const [createMeal, errorMessage] = useErrorMessage(async () => {
  // Validate that both meal type and assigned day are selected if either is provided
  if ((mealForm.value.assignedDay && !mealForm.value.type) || (!mealForm.value.assignedDay && mealForm.value.type)) {
    errorMessage.value = 'Please select both a meal type and an assigned day before submitting.'
    return // Prevent the form from submitting
  }

  if (showExistingMeals.value) {
    // If selecting an existing meal
    const formData = {
      mealName: mealForm.value.selectedMeal,
      mealPlan: mealForm.value.mealPlan,
      assignedDay: Number(mealForm.value.assignedDay),
      type: mealForm.value.type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    }

    // Add the meal to the schedule
    await trpc.mealPlanSchedule.create.mutate(formData)

  } else {
    // Handle new meal creation
    const formData = {
      name: mealForm.value.name,
      calories: Number(mealForm.value.calories),
      ...(mealForm.value.mealPlan && { mealPlan: mealForm.value.mealPlan }),
      ...(mealForm.value.assignedDay && { assignedDay: Number(mealForm.value.assignedDay) }),
      ...(mealForm.value.type && { type: mealForm.value.type as 'breakfast' | 'lunch' | 'dinner' | 'snack' }),
    }

    // Add new meal into the database
    await trpc.meal.create.mutate(formData)

    // If a day is assigned, also add the meal to the schedule
    if (mealForm.value.assignedDay && mealForm.value.type) {
      const scheduleFormData = {
        mealName: mealForm.value.name,
        mealPlan: mealForm.value.mealPlan,
        assignedDay: Number(mealForm.value.assignedDay),
        type: mealForm.value.type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      }

      await trpc.mealPlanSchedule.create.mutate(scheduleFormData)
    }
  }

  successMessage.value = 'Meal added successfully!'
  mealForm.value.name = ''
  mealForm.value.calories = '0'
  mealForm.value.mealPlan = activePlan.value ? activePlan.value : ''
  mealForm.value.selectedMeal = '' // Reset the selected meal
  mealForm.value.assignedDay = '1' // Reset assigned day
  mealForm.value.type = '' // Reset meal type
  showOptions.value = true // Show options after meal is added
})

// properties to dynamically adjust select field options
const filteredPlanDays = computed(() => {
  return showExistingMeals.value
    ? planDays.filter(day => day.value !== '')
    : planDays
})

const filteredAvailablePlans = computed(() => {
  return showExistingMeals.value
    ? availablePlans.value.filter(plan => plan.value !== '')
    : availablePlans.value
})

const goToIngredientsView = () => {
  router.push({ name: 'AddIngredient' })
}

const goToDashboard = () => {
  router.push({ name: 'Home' })
}
</script>


<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Add meal to your plan</FwbHeading>

    <div class="flex items-center mb-6">
      <FwbCheckbox
        v-model="showExistingMeals"
        label="Select an existing meal"
        aria-label="Select existing meal"
      />
    </div>

    <form aria-label="Add Meal" @submit.prevent="createMeal">
      <!-- Conditionally render meal details form or existing meal selection -->
      <div v-if="!showExistingMeals">
        <!-- New meal form fields -->
        <div class="mt-6">
          <FwbInput
            aria-label="Meal name"
            v-model="mealForm.name"
            :minlength="2"
            label="Meal Name"
            placeholder="Meal name"
          />
        </div>
        <div class="mt-6">
          <FwbInput
            aria-label="Calories"
            v-model="mealForm.calories"
            type="number"
            label="Calories"
            placeholder="Calories"
          />
        </div>
        <div class="mt-6">
          <FwbSelect
            v-model="mealForm.type"
            :options="mealTypes"
            label="Meal type"
          />
        </div>
        <div class="mt-6">
          <FwbSelect
            v-model="mealForm.mealPlan"
            :options="filteredAvailablePlans"
            label="Assign to specific meal plan"
          />
        </div>
        <div class="mt-6">
          <FwbSelect
            v-model="mealForm.assignedDay"
            :options="filteredPlanDays"
            label="Assign to specific plan day"
          />
        </div>
      </div>

      <div v-if="showExistingMeals">
        <!-- Existing meal form fields -->
        <div class="mt-6">
          <FwbSelect
            v-model="mealForm.selectedMeal"
            :options="existingMeals"
            label="Select an existing meal"
          />
        </div>
        <div class="mt-6">
          <FwbSelect
            v-model="mealForm.mealPlan"
            :options="filteredAvailablePlans"
            label="Assign to specific meal plan"
          />
        </div>
        <div class="mt-6">
          <FwbSelect
            v-model="mealForm.type"
            :options="mealTypes"
            label="Meal type"
          />
        </div>
        <div class="mt-6">
          <FwbSelect
            v-model="mealForm.assignedDay"
            :options="filteredPlanDays"
            label="Assign to specific plan day"
          />
        </div>
      </div>

      <AlertError :message="errorMessage" />

      <div class="mt-6 flex justify-end">
        <FwbButton size="lg" type="submit">Add meal</FwbButton>
      </div>
    </form>

    <div v-if="successMessage" class="mt-6 text-green-600">
      {{ successMessage }}
      <div class="mt-4 flex space-x-4">
        <FwbButton size="lg" @click="goToIngredientsView">Add Ingredients</FwbButton>
        <FwbButton size="lg" @click="goToDashboard">Go to Dashboard</FwbButton>
      </div>
    </div>
  </div>
</template>

