import React, { useState } from 'react'
import { trpc } from '@/trpc'

export default function AddMealPlan() {
  const [planName, setPlanName] = useState('')
  const [isPlanActive, setIsPlanActive] = useState(false)

  async function handleMealPlanCreation(e: React.FormEvent) {
    e.preventDefault()

    try {
      await trpc.mealPlan.create.mutate({ isActive: isPlanActive, planName })
      setPlanName('')
      setIsPlanActive(false)
    } catch (error) {
      let message
      if (error instanceof Error) message = error.message
      console.error(message)
    }
  }

  return (
    <div>
      <form onSubmit={handleMealPlanCreation}>
        <label htmlFor="plan-name">Meal Plan Name</label>
        <input
          type="text"
          required
          placeholder="My meal plan"
          id="plan-name"
          onChange={(e) => setPlanName(e.target.value)}
          value={planName}
        />
        <label htmlFor="active-status">Active status</label>
        <input
          type="checkbox"
          name=""
          id="active-status"
          checked={isPlanActive}
          onChange={(e) => setIsPlanActive(e.target.checked)}
        />
        <button type="submit">Add Meal Plan</button>
      </form>
    </div>
  )
}
