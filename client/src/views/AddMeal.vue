<script setup lang="ts">
import { trpc } from '@/trpc'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput, FwbSelect, FwbCheckbox, FwbModal } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'

const router = useRouter()
const showExistingMeals = ref(false)
const activePlan = ref('')
const availablePlans = ref<{ value: string; name: string }[]>([])
const existingMeals = ref<{ value: string; name: string }[]>([])
const isShowAIModal = ref(false)
const isMealGenerated = ref(false)
const generatedMeal = ref<any>(null)

const mealForm = ref({
  name: '',
  calories: '0',
  mealPlan: '',
  assignedDay: '1',
  type: '',
  selectedMeal: '',
})

const aiMealForm = ref({
  type: '',
  calories: '',
})

const planDays = [
  { value: '1', name: 'Day 1' },
  { value: '2', name: 'Day 2' },
  { value: '3', name: 'Day 3' },
  { value: '4', name: 'Day 4' },
  { value: '5', name: 'Day 5' },
  { value: '6', name: 'Day 6' },
  { value: '7', name: 'Day 7' },
]

const mealTypes = [
  { value: 'breakfast', name: 'Breakfast' },
  { value: 'lunch', name: 'Lunch' },
  { value: 'dinner', name: 'Dinner' },
  { value: 'snack', name: 'Snack' },
]

const successMessage = ref<string | null>(null)
const showOptions = ref(false)

onMounted(async () => {
  activePlan.value = await trpc.mealPlan.findActiveMealPlan.query()
  const plans = await trpc.mealPlan.findByUserId.query()

  availablePlans.value = [
    ...plans.map((plan) => ({
      value: plan.planName,
      name: plan.planName,
    })),
  ]

  const meals = await trpc.meal.findAll.query()
  existingMeals.value = meals.map((meal) => ({
    name: meal.name,
    value: meal.name,
  }))

  mealForm.value.mealPlan = activePlan.value ? activePlan.value : ''
})

const [createMeal, errorMessage] = useErrorMessage(async () => {
  if (
    (mealForm.value.assignedDay && !mealForm.value.type) ||
    (!mealForm.value.assignedDay && mealForm.value.type)
  ) {
    return // Prevent the form from submitting
  }

  if (showExistingMeals.value) {
    const formData = {
      mealName: mealForm.value.selectedMeal,
      mealPlan: mealForm.value.mealPlan,
      assignedDay: Number(mealForm.value.assignedDay),
      type: mealForm.value.type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    }

    await trpc.mealPlanSchedule.create.mutate(formData)
  } else {
    const formData = {
      name: mealForm.value.name,
      calories: Number(mealForm.value.calories),
      ...(mealForm.value.mealPlan && { mealPlan: mealForm.value.mealPlan }),
      ...(mealForm.value.assignedDay && { assignedDay: Number(mealForm.value.assignedDay) }),
      ...(mealForm.value.type && {
        type: mealForm.value.type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      }),
    }

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
  mealForm.value.selectedMeal = ''
  mealForm.value.assignedDay = '1'
  mealForm.value.type = ''
  showOptions.value = true
})

const filteredPlanDays = computed(() => {
  return showExistingMeals.value ? planDays.filter((day) => day.value !== '') : planDays
})

const filteredAvailablePlans = computed(() => {
  return showExistingMeals.value
    ? availablePlans.value.filter((plan) => plan.value !== '')
    : availablePlans.value
})

function showAIModal() {
  isShowAIModal.value = true
}

function closeAIModal() {
  isShowAIModal.value = false
  isMealGenerated.value = false
  aiMealForm.value = { type: '', calories: '' }
}

const generateAiMeal = async () => {
  const type = aiMealForm.value.type as 'breakfast' | 'lunch' | 'dinner' | 'snack'
  const calories = parseInt(aiMealForm.value.calories, 10)

  try {
    const response = await trpc.aiBot.generateMeal.query({ type, calories })
    generatedMeal.value = response
    isMealGenerated.value = true
  } catch (error) {
    console.error('Error generating meal:', error)
    generatedMeal.value = null
    isMealGenerated.value = false
  }
}

function addAIGeneratedMeal() {
  // 1. save generated meal and ingredients into databa
  // 2. save this meal into plan schedule
  // await trpc.mealPlanSchedule.create.mutate(scheduleFormData)
}

const goToIngredientsView = () => {
  router.push({ name: 'AddIngredient' })
}

const goToDashboard = () => {
  router.push({ name: 'DashboardHome' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <FwbHeading tag="h1" class="text-3xl">Add meal to your plan</FwbHeading>
      <FwbButton
        class="whitespace-nowrap"
        size="lg"
        @click="goToIngredientsView"
        pill
        color="yellow"
        >Add Ingredients</FwbButton
      >
    </div>

    <div class="mb-6 flex items-center">
      <FwbCheckbox
        v-model="showExistingMeals"
        label="Select an existing meal"
        aria-label="Select existing meal"
      />
      <FwbButton class="ml-6 whitespace-nowrap" size="md" @click="showAIModal" pill color="green"
        >Generate AI Meal</FwbButton
      >
    </div>

    <form aria-label="Add Meal" @submit.prevent="createMeal">
      <div v-if="!showExistingMeals">
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
          <FwbSelect v-model="mealForm.type" :options="mealTypes" label="Meal type" />
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
          <FwbSelect v-model="mealForm.type" :options="mealTypes" label="Meal type" />
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

    <fwb-modal v-if="isShowAIModal" @close="closeAIModal" size="lg">
      <template #header>
        <div class="flex items-center text-lg">Use AI To Generate Meal</div>
      </template>
      <template #body>
        <form v-if="!isMealGenerated" @submit.prevent="generateAiMeal">
          <FwbSelect
            v-model="aiMealForm.type"
            :options="mealTypes"
            label="Choose meal type to generate"
          />
          <div class="mt-6">
            <FwbInput
              aria-label="Calories"
              v-model="aiMealForm.calories"
              type="number"
              label="Number of calories"
              placeholder="Calories"
            />
          </div>
          <div class="mt-6 flex justify-end">
            <FwbButton size="lg" type="submit">Generate Meal</FwbButton>
          </div>
        </form>

        <div v-if="isMealGenerated" class="rounded-lg bg-white p-6 shadow-md">
          <h3 class="mb-4 text-xl font-semibold">Generated Meal Details</h3>

          <table class="mb-4 w-full border-collapse">
            <tbody>
              <tr class="border-b">
                <td class="pr-4 font-semibold">Type:</td>
                <td>{{ generatedMeal.type }}</td>
              </tr>
              <tr class="border-b">
                <td class="pr-4 font-semibold">Name:</td>
                <td>{{ generatedMeal.name }}</td>
              </tr>
              <tr class="border-b">
                <td class="pr-4 font-semibold">Calories:</td>
                <td>{{ generatedMeal.calories }}</td>
              </tr>
            </tbody>
          </table>

          <div class="mt-6">
            <h4 class="mb-2 text-lg font-semibold">Ingredients:</h4>
            <ul class="list-disc space-y-1 pl-5">
              <li v-for="ingredient in generatedMeal.ingredients" :key="ingredient.ingredient">
                {{ ingredient.quantity }} {{ ingredient.unit }} of {{ ingredient.ingredient }}
              </li>
            </ul>
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
              label="Assign to specific day"
            />
          </div>

          <div class="mt-6 flex justify-end space-x-4">
            <FwbButton color="green" size="lg">Add Meal to Plan</FwbButton>
            <FwbButton color="pink" size="lg" @click="closeAIModal">Close</FwbButton>
          </div>
        </div>
      </template>
    </fwb-modal>

    <div v-if="successMessage" class="mt-6 text-green-600">
      {{ successMessage }}
      <div class="mt-4 flex space-x-4">
        <FwbButton size="lg" @click="goToIngredientsView">Add Ingredients</FwbButton>
        <FwbButton size="lg" @click="goToDashboard">Go to Dashboard</FwbButton>
      </div>
    </div>
  </div>
</template>
