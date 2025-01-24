import { useUserStore } from '@/stores/user'

export default function useActiveMealPlan() {
  const activePlan = useUserStore((state) => state.activePlan)
  return { activePlan }
}
