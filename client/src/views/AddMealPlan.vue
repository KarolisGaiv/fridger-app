<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput, FwbTextarea } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'

const router = useRouter()

const mealPlanForm = ref({
  planName: ""
})

const successMessage = ref<string | null>(null)

const [createMealPlan, errorMessage] = useErrorMessage(async () => {
  const mealPlan = await trpc.mealPlan.create.mutate(mealPlanForm.value)

  successMessage.value = "Meal plan created successfully!"

  mealPlanForm.value.planName = ""

})

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
</template>
