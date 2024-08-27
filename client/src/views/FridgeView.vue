<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import FridgeItemCard from '@/components/FridgeItemCard.vue'

const fridgeItems = ref<any[]>([])

// onMounted(async () => {
//   // populate fridge if it's empty
//   if (fridgeItems.value.length === 0) {
//     await populateFridge()
//   }
// })

const [populateFridge, errorMessage] = useErrorMessage(async () => {
  const data = await trpc.fridgeContent.populateFridge.mutate()

  const items = await Promise.all(
    data.map(async (item) => {
      const ingredient = await getIngredientName(item.ingredientId)
      return {
        ...item,
        mealName: ingredient.name,
      }
    })
  )
  fridgeItems.value = items
})

async function getIngredientName(ingredientId: number) {
  const data = await trpc.ingredient.findByIngredientId.query({ id: ingredientId })
  return data
}
</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Fridge Content</FwbHeading>
  </div>

  <div class="mt-6">
    <FwbButton size="lg"> Populate fridge </FwbButton>
  </div>

  <!-- Display fridge items as cards -->
  <div class="mt-6 space-y-4">
    <FridgeItemCard
      v-for="item in fridgeItems"
      :key="item.id"
      :mealName="item.mealName"
      :currentQuantity="item.existingQuantity"
    />
  </div>

  <AlertError :message="errorMessage" />
</template>
