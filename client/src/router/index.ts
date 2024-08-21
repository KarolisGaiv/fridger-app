import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { authenticate } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/dashboard',
      component: MainLayout,
      beforeEnter: [authenticate],
      children: [
        {
          path: 'add-meal-plan',
          name: 'AddMealPlan',
          component: () => import('../views/AddMealPlan.vue'),
        },
        {
          path: 'add-meal',
          name: 'AddMeal',
          component: () => import('../views/AddMeal.vue'),
        },
        {
          path: 'add-ingredient',
          name: 'AddIngredient',
          component: () => import('../views/AddIngredient.vue'),
        },
        {
          path: "grocery",
          name: "GroceryView",
          component: () => import("../views/GroceryView.vue")
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '',
      component: MainLayout,
      children: [
        {
          path: 'article/:id',
          name: 'Article',
          component: () => import('../views/ArticleView.vue'),
        },
        {
          path: '',
          name: 'Home',
          component: HomeView,
        },
      ],
    },
  ],
})

export default router
