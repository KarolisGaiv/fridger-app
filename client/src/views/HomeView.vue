<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { trpc } from '@/trpc'
import { FwbButton, FwbHeading } from 'flowbite-vue'
import { isLoggedIn } from '@/stores/user'

const planName = ref({})

onMounted(async () => {
  planName.value = await trpc.mealPlan.findActiveMealPlan.query()
  console.log(planName.value)
})
</script>

<template>
  <div class="dark:bg-gray-800">
    <div v-if="!isLoggedIn" class="rounded-md bg-white px-6 py-8">
      <div class="items-center lg:flex">
        <div class="lg:w-1/2">
          <h2 class="text-4xl font-bold text-gray-800 dark:text-gray-100">Fridger App</h2>
          <p class="mt-4 text-gray-500 dark:text-gray-400 lg:max-w-md">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Nam esse deserunt perferendis
            reprehenderit nesciunt quis doloremque rerum dolor optio, facere fuga deleniti debitis
            natus aperiam sit veritatis sequi cum sunt.
          </p>
          <div class="mt-6 flex items-center gap-2">
            <FwbButton component="RouterLink" tag="router-link" href="/signup">Sign up</FwbButton>
            <FwbButton component="RouterLink" tag="router-link" color="alternative" href="/login">
              Log in
            </FwbButton>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isLoggedIn" class="text-4xl font-bold text-gray-800 dark:text-gray-100">
      <FwbHeading tag="h1" class="text-3xl">Your current meal plan details</FwbHeading>
    </div>
    <div class="mt-6" v-if="planName">
      <FwbHeading tag="h3" class="text-3xl">Active Plan: {{ planName }}</FwbHeading>
    </div>
  </div>
</template>
