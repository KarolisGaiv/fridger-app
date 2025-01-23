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
    <div className="mx-auto mt-10 max-w-md rounded bg-white p-4 shadow-md">
      <h2 className="mb-4 text-lg font-bold">Add Meal Plan</h2>
      <form onSubmit={handleMealPlanCreation}>
        <div className="mb-4">
          <label htmlFor="plan-name" className="mb-2 block text-sm font-medium">
            Meal Plan Name
          </label>
          <input
            type="text"
            required
            placeholder="My meal plan"
            id="plan-name"
            className="block w-full rounded border border-gray-300 p-2"
            onChange={(e) => setPlanName(e.target.value)}
            value={planName}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="active-status" className="mb-2 block text-sm font-medium">
            Active status
          </label>
          <input
            type="checkbox"
            name=""
            id="active-status"
            checked={isPlanActive}
            onChange={(e) => setIsPlanActive(e.target.checked)}
            className="mr-2"
          />
          <span>Active</span>
        </div>
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white transition duration-200 hover:bg-blue-700"
        >
          Add Meal Plan
        </button>
      </form>
    </div>
  )
}
