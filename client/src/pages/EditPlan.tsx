import useActiveMealPlan from '@/stores/useActiveMealPlan '

export default function EditPlanPage() {
  const { activePlan } = useActiveMealPlan()

  return (
    <div>
      <h1>Edit Plan</h1>
      <h2>Current active meal plan: {activePlan}</h2>
    </div>
  )
}
