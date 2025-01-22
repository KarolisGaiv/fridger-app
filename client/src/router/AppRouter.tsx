import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth } from './guards'
import MainLayout from '@/layouts/MainLayout'

// Lazy loading the components
const Dashboard = React.lazy(() => import('@/pages/DashboardPage'))
const LoginPage = React.lazy(() => import('@/pages/LoginPage'))
const RegisterPage = React.lazy(() => import('@/pages/RegisterPage'))

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
          {/* <Route path="add-meal-plan" element={<AddMealPlan />} />
          <Route path="add-meal" element={<AddMeal />} />
          <Route path="add-ingredient" element={<AddIngredient />} />
          <Route path="grocery" element={<GroceryView />} />
          <Route path="fridge" element={<FridgeView />} /> */}
        </Route>

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
