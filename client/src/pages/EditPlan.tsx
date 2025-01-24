import useActiveMealPlan from '@/stores/useActiveMealPlan '
import usePlannedMeals from '@/stores/usePlannedMeals'

export default function EditPlanPage() {
  const { activePlan } = useActiveMealPlan()
  const { plannedMeals } = usePlannedMeals()

  return (
    <div>
      <h1>Edit Your Plan Here</h1>
      <h2>Active Meal Plan: {activePlan}</h2>

      <></>
      <h3>Your plan</h3>
      <ul>
        {plannedMeals.map((meal, index) => {
          return (
            <li key={index}>
              {meal.name} - {meal.completed ? 'Completed' : 'Not Completed'}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
