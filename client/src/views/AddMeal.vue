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
  name: "",
  calories: "0",
})

const successMessage = ref<string | null>(null)

// Error handling hook
const [createMeal, errorMessage] = useErrorMessage(async () => {
    const formData = {
    name: mealForm.value.name,
    calories: Number(mealForm.value.calories), // Convert back to number
  }

  await trpc.meal.create.mutate(formData)
  
  successMessage.value = "Meal added successfully!"
  mealForm.value.name = ""
  mealForm.value.calories = "0"
})

</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Add a meal to your plan</FwbHeading>

    <!-- Meal Addition Form -->
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

    <!-- Show success message and option to go back to dashboard -->
    <div v-if="successMessage" class="mt-6 text-green-600">
      {{ successMessage }}
    </div>
  </div>
</template>
