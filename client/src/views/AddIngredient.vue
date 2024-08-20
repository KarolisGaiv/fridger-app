<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput, FwbTextarea } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import type { MealPublic } from '../../../server/src/entities/meal'

// State for meals and selected meal
const meals = ref<MealPublic[]>([]) // Array to hold all user meals
const ingredients = ref<[]>([])
const selectedMealName = ref<string | null>(null)
const showIngredientFormSelection = ref<boolean>(false)
const showIngredientForm = ref<boolean>(false)

const showSelectIngredientForm = ref<boolean>(false)
const showAddNewIngredientForm = ref<boolean>(false)

// State for Ingredients form
const ingredientForm = ref({
  name: '',
  quantity: '',
})

const successMessage = ref<string | null>(null)

// Fetch all meals when the component is mounted
onMounted(async () => {
  meals.value = await trpc.meal.findAll.query()
  ingredients.value = await trpc.ingredient.findAll.query()
})

// Handle meal selection
// const selectMeal = async () => {
//   console.log(selectedMealName.value);
//   // showIngredientFormSelection.value = true

//   // showIngredientForm.value = true
// }

const getMealDetails = async () => {
  // Fetch the meal ID based on the selected meal name
  if (!selectedMealName.value) {
    console.error('No meal selected')
    return
  }
  const selectedMeal = await trpc.meal.findByName.query({ name: selectedMealName.value })
  const selectedMealId = selectedMeal.id
  showIngredientFormSelection.value = true
  console.log('selected meal id ', selectedMealId)
}

// Handle ingredient creation
const [createIngredient, errorMessage] = useErrorMessage(async () => {
  // Fetch the meal ID based on the selected meal name
  if (!selectedMealName.value) {
    console.error('No meal selected')
    return
  }
  const selectedMeal = await trpc.meal.findByName.query({ name: selectedMealName.value })
  const selectedMealId = selectedMeal.id

  // create new ingredient into database
  const ingredient = await trpc.ingredient.create.mutate({ name: ingredientForm.value.name })

  // create new meal ingredient into database
  const ingredientId = (
    await trpc.ingredient.findByName.query({ name: ingredient.ingredientCreated.name })
  ).id
  const quantity = parseFloat(ingredientForm.value.quantity)

  await trpc.mealIngredient.create.mutate({ quantity, ingredientId, mealId: selectedMealId })

  successMessage.value = `${ingredientForm.value.name} added to '${selectedMealName.value}' meal successfully!`

  // Reset the form
  ingredientForm.value.name = ''
  ingredientForm.value.quantity = ''
  selectedMealName.value = null
  showIngredientForm.value = false
})

// Show form to select existing ingredient
const showSelectIngredientFormHandler = () => {
  showSelectIngredientForm.value = true
  showAddNewIngredientForm.value = false
}

// Show form to add new ingredient
const showAddIngredientFormHandler = () => {
  showSelectIngredientForm.value = false
  showAddNewIngredientForm.value = true
}
</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Add ingredients to you meal</FwbHeading>
  </div>
  <form aria-lable="User Meal">
    <!-- Meal Selection -->
    <div class="mt-6">
      <label for="mealSelect" class="block text-sm font-medium text-gray-700">Select Meal</label>
      <select
        id="mealSelect"
        v-model="selectedMealName"
        class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        @change="getMealDetails()"
      >
        <option value="" disabled>Your meals</option>
        <option v-for="meal in meals" :key="meal.name" :value="meal.name">
          {{ meal.name }}
        </option>
      </select>
    </div>
  </form>

  <div v-if="showIngredientFormSelection" class="mt-4 flex space-x-4">
    <FwbButton size="lg" @click="showSelectIngredientFormHandler"
      >Select existing ingredient</FwbButton
    >
    <FwbButton size="lg" @click="showAddIngredientFormHandler">Add new ingredient</FwbButton>
  </div>

  <!-- Show success message -->
  <div v-if="successMessage" class="mt-6 text-green-600">
    {{ successMessage }}
  </div>

  <AlertError :message="errorMessage" />
</template>
