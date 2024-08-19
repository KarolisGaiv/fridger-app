<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'

const route = useRoute()
const router = useRouter()

// State for Meal form
const mealForm = ref({
  name: '',
  calories: '0',
})

// State for Ingredients form
const ingredientForm = ref({
  name: '',
  quantity: '',
})

const successMessage = ref<string | null>(null)
const showOptions = ref(false) // Show options after meal is added
const showIngredientsForm = ref(false) // Show ingredients form
const mealId = ref<number | null>(null)
const ingredientId = ref<number | null>(null)

const [createMeal, errorMessage] = useErrorMessage(async () => {
  const formData = {
    name: mealForm.value.name,
    calories: Number(mealForm.value.calories), // Convert back to number
  }

  // add new meal into database
  await trpc.meal.create.mutate(formData)

  // get meal ID from database
  const meal = await trpc.meal.findByName.query({ name: formData.name })
  mealId.value = meal.id

  successMessage.value = 'Meal added successfully!'
  mealForm.value.name = ''
  mealForm.value.calories = '0'
  showOptions.value = true // Show options after meal is added
  showIngredientsForm.value = false // Hide ingredients form initially
})

// Handle ingredient creation
const [createIngredient, ingredientError] = useErrorMessage(async () => {
  const ingredientData = {
    name: ingredientForm.value.name,
  }

  // add new ingredient into database
  await trpc.ingredient.create.mutate(ingredientData)

  // get new ingredient ID from database
  const ingredient = await trpc.ingredient.findByName.query({ name: ingredientData.name })
  ingredientId.value = ingredient.id

  // add meal ingredient into database
  await trpc.mealIngredient.create.mutate({
    quantity: Number(ingredientForm.value.quantity),
    ingredientId: ingredientId.value,
    mealId: mealId.value!,
  })

  // Reset ingredients form and hide form after successful addition
  ingredientForm.value.name = ''
  ingredientForm.value.quantity = ''
})

const goToDashboard = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Add a meal to your plan</FwbHeading>

    <form aria-label="Add Meal" @submit.prevent="createMeal">
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

      <AlertError :message="errorMessage" />

      <div class="mt-6 flex justify-end">
        <FwbButton size="lg" type="submit">Add meal</FwbButton>
      </div>
    </form>

    <div v-if="successMessage" class="mt-6 text-green-600">
      {{ successMessage }}
      <div class="mt-4 flex space-x-4">
        <FwbButton size="lg" @click="showIngredientsForm = true">Add Ingredients</FwbButton>
        <FwbButton size="lg" @click="goToDashboard">Go to Dashboard</FwbButton>
      </div>
    </div>

    <!-- Ingredients Form -->
    <div v-if="showIngredientsForm" class="mt-6">
      <FwbHeading tag="h2" class="text-2xl">Add Ingredients</FwbHeading>
      <form aria-label="Add Ingredient" @submit.prevent="createIngredient">
        <div class="mt-6">
          <FwbInput
            aria-label="Ingredient name"
            v-model="ingredientForm.name"
            :minlength="2"
            label="Ingredient Name"
            placeholder="Ingredient name"
          />
        </div>
        <div class="mt-6">
          <FwbInput
            aria-label="Quantity"
            v-model="ingredientForm.quantity"
            label="Quantity"
            placeholder="Quantity"
          />
        </div>

        <AlertError :message="ingredientError" />

        <div class="mt-6 flex justify-end">
          <FwbButton size="lg" type="submit">Add Ingredient</FwbButton>
        </div>
      </form>
    </div>
  </div>
</template>
