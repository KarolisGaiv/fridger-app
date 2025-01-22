import { Link, Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="main-layout">
      <header>
        <nav>
          <ul>
            <li>
              <Link to="/add-meal-plan">Add Meal Plan</Link>
            </li>
            <li>
              <Link to="/add-meal">Add Meal</Link>
            </li>
            <li>
              <Link to="/grocery-list">Grocery List</Link>
            </li>
            <li>
              <Link to="/fridge">Fridge</Link>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
