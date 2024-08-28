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
    class="flex flex-col items-start justify-between p-4 border border-gray-200 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300 ease-in-out"
  >
    <div class="flex items-center justify-between w-full mb-2">
      <p class="text-xl font-semibold text-gray-900">{{ product }}</p>
      <span class="text-lg font-medium text-gray-700">{{ quantity }}</span>
    </div>
  </div>
</template>
