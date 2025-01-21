import Link from 'next/link'
const Navigation = () => {
  return (
    <nav className="flex justify-around bg-green-400 py-8">
      <Link href="/add-meal-plan">Add Meal Plan</Link>
      <Link href="/edit-meal-plan">Edit Meal Plan</Link>
      <Link href="/grocery-list">Grocery List</Link>
    </nav>
  )
}

export default Navigation
