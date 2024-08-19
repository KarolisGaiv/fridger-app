<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput, FwbTextarea } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'

const router = useRouter()

const mealPlanForm = ref({
  planName: '',
})

const successMessage = ref<string | null>(null)
const showOptions = ref<boolean>(false)
const createdMealPlanId = ref<number | null>(null)

const [createMealPlan, errorMessage] = useErrorMessage(async () => {
  const mealPlan = await trpc.mealPlan.create.mutate(mealPlanForm.value)

  successMessage.value = 'Meal plan created successfully!'
  createdMealPlanId.value = mealPlan.id

  mealPlanForm.value.planName = ''

  showOptions.value = true // Show options for adding meals or going to dashboard
})

const addMeals = () => {
  if (createdMealPlanId.value) {
    router.push({ name: 'AddMeals', params: { mealPlanId: createdMealPlanId.value } })
  }
}

const goToDashboard = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <form aria-label="Meal Plan" @submit.prevent="createMealPlan">
    <div class="space-y-6">
      <FwbHeading tag="h1" class="text-3xl">Create a new meal plan</FwbHeading>

      <div class="mt-6">
        <FwbInput
          aria-label="Meal plan name"
          v-model="mealPlanForm.planName"
          :minlength="2"
          label="Meal Plan Name"
          placeholder="My meal plan"
        />
      </div>
    </div>

    <!-- Show success message -->
    <div v-if="successMessage" class="mt-6 text-green-600">
      {{ successMessage }}
    </div>

    <AlertError :message="errorMessage" />

    <div class="mt-6 flex justify-end">
      <FwbButton size="lg" type="submit">Add meal plan</FwbButton>
    </div>
  </form>

  <div v-if="showOptions" class="mt-6 space-x-4">
    <p>Would you like to add meals to this plan?</p>
    <FwbButton size="lg" @click="addMeals">Yes, add meals</FwbButton>
    <FwbButton size="lg" @click="goToDashboard">No, go to dashboard</FwbButton>
  </div>
</template>
