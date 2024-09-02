<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'
import FridgeItemCard from '@/components/FridgeItemCard.vue'

const fridgeItems = ref<any[]>([])

onMounted(async () => {
  fridgeItems.value = await trpc.fridgeContent.findByUser.query()
})
</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Fridge Content</FwbHeading>
  </div>

  <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    <FridgeItemCard
      v-for="item in fridgeItems"
      :key="item.id"
      :mealName="item.name"
      :currentQuantity="item.existingQuantity"
    />
  </div>
</template>
