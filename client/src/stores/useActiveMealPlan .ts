import { useUserStore } from '@/stores/user'
import { useEffect, useState } from 'react'
import type { UserState } from '@/stores/user'

export default function useActiveMealPlan() {
  const [loading, setLoading] = useState(true)
  const activePlan = useUserStore((state: UserState) => state.activePlan)
  const getActiveMealPlan = useUserStore((state) => state.getActiveMealPlan)

  useEffect(() => {
    const fetchPlan = async () => {
      await getActiveMealPlan()
      setLoading(false)
    }
    fetchPlan()
  }, [getActiveMealPlan])

  if (loading) return { loading: true, activePlan: null }
  return { loading: false, activePlan }
}
