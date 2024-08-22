<script lang="ts" setup>
export interface GroceryListItem {
  mealPlanId: number | null
  product: string
  quantity: number
  ingredientId: number
}

defineProps({
  product: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div
    class="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800"
  >
    <p class="text-lg font-semibold">{{ product }}</p>
    <p class="text-sm text-gray-500">Quantity: {{ quantity }}g</p>
  </div>
</template>
