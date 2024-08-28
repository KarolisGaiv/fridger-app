<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading } from 'flowbite-vue'
// import useErrorMessage from '@/composables/useErrorMessage'
// import AlertError from '@/components/AlertError.vue'
import FridgeItemCard from '@/components/FridgeItemCard.vue'

const fridgeItems = ref<any[]>([])

onMounted(async () => {
  fridgeItems.value = await trpc.fridgeContent.findByUser.query()
})

const testAI = async () => {
  const test = await trpc.aiBot.create.query()
  console.log(test)
}
</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Fridge Content</FwbHeading>
  </div>

  <div class="mt-6">
    <FwbButton size="lg" @click="testAI"> TEST </FwbButton>
  </div>

  <div class="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    <FridgeItemCard
      v-for="item in fridgeItems"
      :key="item.id"
      :mealName="item.name"
      :currentQuantity="item.existingQuantity"
    />
  </div>

  <!-- <AlertError :message="errorMessage" /> -->
</template>
