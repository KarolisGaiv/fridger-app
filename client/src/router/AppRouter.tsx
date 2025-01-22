import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth } from './guards'
import MainLayout from '@/layouts/MainLayout'

// Lazy loading the components
const Dashboard = React.lazy(() => import('../views/Dashboard'))
const AddMealPlan = React.lazy(() => import('../views/AddMealPlan'))
const AddMeal = React.lazy(() => import('../views/AddMeal'))
const AddIngredient = React.lazy(() => import('../views/AddIngredient'))
const GroceryView = React.lazy(() => import('../views/GroceryView'))
const FridgeView = React.lazy(() => import('../views/FridgeView'))
const LoginView = React.lazy(() => import('../views/LoginView'))
const SignupView = React.lazy(() => import('../views/SignupView'))

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Protected routes within MainLayout */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-meal-plan" element={<AddMealPlan />} />
          <Route path="add-meal" element={<AddMeal />} />
          <Route path="add-ingredient" element={<AddIngredient />} />
          <Route path="grocery" element={<GroceryView />} />
          <Route path="fridge" element={<FridgeView />} />
        </Route>

        {/* Public routes */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignupView />} />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
