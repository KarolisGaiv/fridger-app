<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted, watch } from 'vue'
import { FwbButton, FwbHeading, FwbInput, FwbToast } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import type { MealPublic } from '../../../server/src/entities/meal'
import type { IngredientPublic } from '../../../server/src/entities/ingredient'

const meals = ref<MealPublic[]>([])
const ingredients = ref<IngredientPublic[]>([])
const selectedMealName = ref<string | null>(null)
const selectedMealId = ref<number | null>(null)
const showIngredientFormSelection = ref<boolean>(false)
const showIngredients = ref<boolean>(false)

const showSelectIngredientForm = ref<boolean>(false)
const showAddNewIngredientForm = ref<boolean>(false)

const ingredientForm = ref({
  name: '',
  quantity: '',
})

const successMessage = ref<string | null>(null)
let successMessageTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  meals.value = await trpc.meal.findAll.query()
})

const getMealDetails = async () => {
  if (!selectedMealName.value) {
    console.error('No meal selected')
    return
  }
  const selectedMeal = await trpc.meal.findByName.query({ name: selectedMealName.value })
  selectedMealId.value = selectedMeal.id
  showIngredientFormSelection.value = true
  showSelectIngredientForm.value = false
  showAddNewIngredientForm.value = false
}

const [createIngredient, errorMessage] = useErrorMessage(async () => {
  if (selectedMealId.value === null) {
    console.error('Meal ID is null')
    return
  }

  if (showAddNewIngredientForm.value) {
    await trpc.ingredient.create.mutate({ name: ingredientForm.value.name })

    ingredients.value.push({
      name: ingredientForm.value.name,
    })
  }

  const ingredientId = (await trpc.ingredient.findByName.query({ name: ingredientForm.value.name }))
    .id
  const quantity = parseFloat(ingredientForm.value.quantity)

  await trpc.mealIngredient.create.mutate({ ingredientId, quantity, mealId: selectedMealId.value })

  successMessage.value = `${ingredientForm.value.name} added to '${selectedMealName.value}' meal successfully!`

  if (successMessageTimer) {
    clearTimeout(successMessageTimer)
  }

  successMessageTimer = setTimeout(() => {
    successMessage.value = null
  }, 3000)

  ingredientForm.value.name = ''
  ingredientForm.value.quantity = ''
  selectedMealName.value = null

  showIngredientFormSelection.value = false
  showSelectIngredientForm.value = false
  showAddNewIngredientForm.value = false
})

const showSelectIngredientFormHandler = async () => {
  showSelectIngredientForm.value = true
  showAddNewIngredientForm.value = false
  ingredientForm.value.quantity = ''

  if (ingredients.value.length === 0) {
    ingredients.value = await trpc.ingredient.findAll.query()
  }
}

const showAddIngredientFormHandler = () => {
  showSelectIngredientForm.value = false
  showAddNewIngredientForm.value = true
  ingredientForm.value.name = ''
  ingredientForm.value.quantity = ''
}

const toggleShowIngredients = async () => {
  if (ingredients.value.length === 0) {
    ingredients.value = await trpc.ingredient.findAll.query()
  }

  showIngredients.value = !showIngredients.value
}

watch(successMessage, (newValue) => {
  if (!newValue && successMessageTimer) {
    clearTimeout(successMessageTimer)
    successMessageTimer = null
  }
})
</script>

<template>
  <div class="flex items-center justify-between space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Add Ingredients To Meal</FwbHeading>
    <FwbButton
      size="lg"
      class="whitespace-nowrap"
      pill
      color="yellow"
      @click="toggleShowIngredients"
    >
      {{ showIngredients ? 'Hide Ingredients' : 'Show Ingredients' }}
    </FwbButton>
  </div>
  <form aria-lable="User Meal">
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
    <FwbButton size="lg" @click="showSelectIngredientFormHandler">
      Select existing ingredient
    </FwbButton>
    <FwbButton size="lg" @click="showAddIngredientFormHandler">Add new ingredient</FwbButton>
  </div>

  <form
    v-if="showSelectIngredientForm || showAddNewIngredientForm"
    aria-label="Add ingredient to the meal"
    @submit.prevent="createIngredient"
  >
    <div class="mt-6">
      <label
        :for="showAddNewIngredientForm ? 'ingredientAddition' : 'ingredientSelect'"
        class="block text-sm font-medium text-gray-700"
      >
        {{ showAddNewIngredientForm ? 'Add New Ingredient' : 'Select Ingredient' }}
      </label>
      <div v-if="showAddNewIngredientForm">
        <input
          id="ingredientAddition"
          type="text"
          v-model="ingredientForm.name"
          class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Add new ingredient"
        />
      </div>
      <div v-else>
        <select
          id="ingredientSelect"
          v-model="ingredientForm.name"
          class="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="" disabled>Available ingredients</option>
          <option v-for="ingredient in ingredients" :key="ingredient.name" :value="ingredient.name">
            {{ ingredient.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="mt-6">
      <FwbInput
        aria-label="Quantity"
        label="Quantity"
        type="number"
        id="quantity"
        v-model="ingredientForm.quantity"
        placeholder="Enter quantity"
      />
    </div>

    <div class="mt-6">
      <FwbButton size="lg" type="submit">
        {{ showAddNewIngredientForm ? 'Add New Ingredient' : 'Add Selected Ingredient' }}
      </FwbButton>
    </div>
  </form>

  <transition name="fade" class="mt-6">
    <fwb-toast v-if="successMessage" closable type="success">
      {{ successMessage }}
    </fwb-toast>
  </transition>

  <AlertError :message="errorMessage" />

  <div v-if="showIngredients" class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="ingredient in ingredients"
      :key="ingredient.name"
      class="rounded-lg border border-gray-300 bg-white p-4 shadow-sm transition duration-150 ease-in-out hover:bg-gray-50"
    >
      <h3 class="text-lg font-medium">{{ ingredient.name }}</h3>
    </div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
