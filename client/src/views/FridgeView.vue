<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'
import FridgeItemCard from '@/components/FridgeItemCard.vue'

const fridgeItems = ref<any[]>([])

const [populateFridge, errorMessage] = useErrorMessage(async () => {
    const data = await trpc.fridgeContent.populateFridge.mutate()
    fridgeItems.value = data
    console.log(data);
})

// async function getIngredientName(ingredientId) {
//     const data = await trpc.ingredient.
// }

</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Fridge Content</FwbHeading>
  </div>

  <div class="mt-6">
    <FwbButton size="lg" @click="populateFridge"> Populate fridge </FwbButton>
  </div>

  <!-- Display fridge items as cards -->
  <div class="mt-6 space-y-4">
    <FridgeItemCard
      v-for="item in fridgeItems"
      :key="item.id"
      :mealName="'Meal Plan ' + item.mealPlan"
      :currentQuantity="item.existingQuantity"
    />
  </div>

  <AlertError :message="errorMessage" />
</template>
