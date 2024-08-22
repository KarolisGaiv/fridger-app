<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import GroceryItemCard, { type GroceryListItem } from '@/components/GroceryItemCard.vue'

const activeMealPlan = ref({})
const groceryList = ref<GroceryListItem[]>([])

onMounted(async () => {
  activeMealPlan.value = await trpc.mealPlan.findActiveMealPlan.query()
})

const [generateGroceryList, errorMessage] = useErrorMessage(async () => {
  const data = await trpc.groceryList.generateGroceryList.mutate()
  groceryList.value = data
})
</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Grocery List</FwbHeading>
  </div>

  <div class="mt-6">
    <FwbButton size="lg" @click="generateGroceryList"> Generate grocery list </FwbButton>
  </div>

  <!-- Display grocery list items as cards -->
  <div class="mt-6 space-y-4">
    <GroceryItemCard
      v-for="item in groceryList"
      :key="item.ingredientId"
      :product="item.product"
      :quantity="item.quantity"
    />
  </div>

  <AlertError :message="errorMessage" />
</template>
