// import { useUserStore } from '@/stores/user'
// import { useEffect, useState } from 'react'
// import type { UserState } from '@/stores/user'

// export default function usePlannedMeals() {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const plannedMeals = useUserStore((state: UserState) => state.plannedMeals)
//   const getPlannedMeals = useUserStore((state) => state.getPlannedMeals)

//   useEffect(() => {
//     if (plannedMeals.length === 0) {
//       setLoading(true)
//       async function fetchPlannedMeals() {
//         try {
//           await getPlannedMeals()
//         } catch (err) {
//           setError(err instanceof Error ? err.message : 'Failed to fetch planned meals')
//         } finally {
//           setLoading(false)
//         }
//       }
//       fetchPlannedMeals()
//     }
//   }, [getPlannedMeals, plannedMeals.length])

//   return { loading, plannedMeals, error }
// }

import { useUserStore } from '@/stores/user'

export default function usePlannedMeals() {
  const plannedMeals = useUserStore((state) => state.plannedMeals)
  return { plannedMeals }
}
