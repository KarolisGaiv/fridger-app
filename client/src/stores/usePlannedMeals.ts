import { useUserStore } from '@/stores/user'
import type { UserState } from '@/stores/user'

export default function usePlannedMeals() {
  const plannedMeals = useUserStore((state: UserState) => state.plannedMeals)
  return { plannedMeals }
}
