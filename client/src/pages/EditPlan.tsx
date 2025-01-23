import { trpc } from '@/trpc'
import { useEffect, useState } from 'react'

export default function EditPlanPage() {
  const [planName, setPlanName] = useState('')

  useEffect(() => {
    async function getActiveMealPlanName() {
      const res = await trpc.mealPlan.findActiveMealPlan.query()
      setPlanName(res)
    }
    getActiveMealPlanName()
  }, [])

  return (
    <div>
      <h1>Edit Plan</h1>
      <h2>Current active meal plan: {planName}</h2>
    </div>
  )
}
