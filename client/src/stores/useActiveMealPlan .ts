import { useUserStore } from '@/stores/user'
import type { UserState } from '@/stores/user'

export default function useActiveMealPlan() {
  const activePlan = useUserStore((state: UserState) => state.activePlan)
  return { activePlan }
}
