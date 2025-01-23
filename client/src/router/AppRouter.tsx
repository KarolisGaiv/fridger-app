import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RequireAuth } from './guards'
import MainLayout from '@/layouts/MainLayout'

const Dashboard = React.lazy(() => import('@/pages/Dashboard'))
const LoginPage = React.lazy(() => import('@/pages/Login'))
const RegisterPage = React.lazy(() => import('@/pages/Register'))
const AddMealPlanPage = React.lazy(() => import('@/pages/AddMealPlan'))

const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>

        <Route
          path="/add-meal-plan"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AddMealPlanPage />} />
        </Route>

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default AppRouter
