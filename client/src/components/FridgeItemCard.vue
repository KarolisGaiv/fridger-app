<script setup lang="ts">
interface Props {
  mealName: string
  currentQuantity: number
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-lg bg-white p-4 shadow-md">
    <h3 class="text-xl font-bold">{{ mealName }}</h3>
    <p class="text-gray-700">Quantity: {{ currentQuantity }}</p>
  </div>
</template>
