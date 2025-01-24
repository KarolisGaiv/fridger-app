import useActiveMealPlan from '@/stores/useActiveMealPlan '
import usePlannedMeals from '@/stores/usePlannedMeals'
import MealCalendar from '@/components/MealCalendar'

export default function EditPlanPage() {
  const { activePlan } = useActiveMealPlan()
  const { plannedMeals } = usePlannedMeals()

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-2xl font-bold">Edit Your Plan Here</h1>
      <h2 className="mb-4 text-xl font-medium">Active Meal Plan: {activePlan}</h2>

      <h3 className="mb-4 text-lg font-semibold">Your Weekly Plan</h3>
      <MealCalendar plannedMeals={plannedMeals} />
    </div>
  )
}
