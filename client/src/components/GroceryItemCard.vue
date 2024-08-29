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
    class="flex flex-col items-start justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-shadow duration-300 ease-in-out hover:shadow-lg"
  >
    <div class="mb-2 flex w-full items-center justify-between">
      <p class="text-xl font-semibold text-gray-900">{{ product }}</p>
      <span class="text-lg font-medium text-gray-700">{{ quantity }}</span>
    </div>
  </div>
</template>
