import { useUserStore } from '@/stores/user'

export default function usePlannedMeals() {
  const plannedMeals = useUserStore((state) => state.plannedMeals)
  return { plannedMeals }
}
