type Meal = {
  name: string
  calories: number
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  assignedDay: number // 1 (Monday) to 7 (Sunday)
  completed: boolean
}

type WeeklyMealCalendarProps = {
  plannedMeals: Meal[]
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function WeeklyMealCalendar({ plannedMeals }: WeeklyMealCalendarProps) {
  // Group meals by assignedDay (1-7)
  const mealsByDay = Array.from({ length: 7 }, (_, i) =>
    plannedMeals.filter((meal) => meal.assignedDay === i + 1)
  )

  return (
    <div className="grid grid-cols-7 gap-4">
      {daysOfWeek.map((day, index) => (
        <div key={day} className="rounded-lg border border-gray-300 bg-gray-50 p-4">
          <h3 className="text-center text-lg font-semibold">{day}</h3>
          <ul className="mt-2">
            {mealsByDay[index].length === 0 ? (
              <li className="text-center text-gray-500">No meals planned</li>
            ) : (
              mealsByDay[index].map((meal, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>
                    {meal.name} ({meal.type})
                  </span>
                  <span>{meal.completed ? '✅' : '❌'}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </div>
  )
}
