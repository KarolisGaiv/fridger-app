import { Link, Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="main-layout flex min-h-screen flex-col">
      <header className="bg-blue-500 py-4 text-white">
        <nav className="container mx-auto flex justify-center">
          <ul className="flex space-x-4">
            <li>
              <Link to="/add-meal-plan" className="hover:text-gray-300">
                Add Meal Plan
              </Link>
            </li>

            <li>
              <Link to="/add-meal" className="hover:text-gray-300">
                Add Meal
              </Link>
            </li>
            <li>
              <Link to="/grocery-list" className="hover:text-gray-300">
                Grocery List
              </Link>
            </li>
            <li>
              <Link to="/fridge" className="hover:text-gray-300">
                Fridge
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className="container mx-auto mt-4 flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
