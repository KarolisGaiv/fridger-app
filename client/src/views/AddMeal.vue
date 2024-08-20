<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'

const router = useRouter()

// State for Meal form
const mealForm = ref({
  name: '',
  calories: '0',
})

const successMessage = ref<string | null>(null)
const showOptions = ref(false) // Show options after meal is added

const [createMeal, errorMessage] = useErrorMessage(async () => {
  const formData = {
    name: mealForm.value.name,
    calories: Number(mealForm.value.calories), // Convert back to number
  }

  // add new meal into database
  await trpc.meal.create.mutate(formData)

  successMessage.value = 'Meal added successfully!'
  mealForm.value.name = ''
  mealForm.value.calories = '0'
  showOptions.value = true // Show options after meal is added
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
        <FwbButton size="lg" @click="goToIngredientsView">Add Ingredients</FwbButton>
        <FwbButton size="lg" @click="goToDashboard">Go to Dashboard</FwbButton>
      </div>
    </div>
  </div>
</template>
