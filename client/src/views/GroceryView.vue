<script setup lang="ts">
import { trpc } from '@/trpc'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FwbButton, FwbHeading, FwbInput } from 'flowbite-vue'
import useErrorMessage from '@/composables/useErrorMessage'
import AlertError from '@/components/AlertError.vue'

const activeMealPlan = ref({})

onMounted( async () => {
  activeMealPlan.value = await trpc.mealPlan.findActiveMealPlan.query()
  console.log(activeMealPlan.value);
})



</script>

<template>
  <div class="space-y-6">
    <FwbHeading tag="h1" class="text-3xl">Grocery List</FwbHeading>
  </div>

  <div class="mt-6">
    <FwbButton size="lg"> Generate grocery list </FwbButton>
  </div>
</template>
