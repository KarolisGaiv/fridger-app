<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'
import { FwbButton, FwbHeading, FwbSelect } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import GroceryItemCard, { type GroceryListItem } from '@/components/GroceryItemCard.vue'

const availablePlans = ref<{ value: string; name: string }[]>([])
const groceryList = ref<GroceryListItem[]>([])
const mealPlan = ref('')

onMounted(async () => {
  const plans = await trpc.mealPlan.findByUserId.query()
  availablePlans.value = [
    ...plans.map((plan) => ({
      value: plan.planName,
      name: plan.planName,
    })),
  ]

  const activePlan = await trpc.mealPlan.findActiveMealPlan.query()
  groceryList.value = await trpc.groceryList.findByMealPlanName.query({ planName: activePlan })
})

const [generateGroceryList, errorMessage] = useErrorMessage(async () => {
  const data = await trpc.groceryList.generateGroceryList.mutate({ planName: mealPlan.value })
  groceryList.value = data
})

const [populateFridge, fridgeFuncionalityErrMessage] = useErrorMessage(async () => {
  await trpc.fridgeContent.populateFridge.mutate({ planName: mealPlan.value })
})
</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Grocery List</FwbHeading>
  </div>

  <form aria-label="Grocery list">
    <div class="mt-6">
      <FwbSelect :options="availablePlans" v-model="mealPlan" label="Select meal plan" />
    </div>
  </form>

  <div class="mt-6">
    <FwbButton size="lg" @click="generateGroceryList"> Generate grocery list </FwbButton>
  </div>

  <div class="mt-6" v-if="groceryList.length > 0">
    <FwbButton size="lg" @click="populateFridge"> Transfer ingredients to the fridge </FwbButton>
  </div>

  <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    <GroceryItemCard
      v-for="item in groceryList"
      :key="item.ingredientId"
      :product="item.product"
      :quantity="item.quantity"
    />
  </div>

  <AlertError :message="errorMessage" />
  <AlertError :message="fridgeFuncionalityErrMessage" />
</template>
