<script setup lang="ts">
interface Props {
  mealName: string
  currentQuantity: number
}

defineProps<Props>()
</script>


<template>
    <div class="bg-white shadow-md rounded-lg p-4">
      <h3 class="text-xl font-bold">{{ mealName }}</h3>
      <p class="text-gray-700">Quantity: {{ currentQuantity }}</p>
    </div>
  </template>
  
  