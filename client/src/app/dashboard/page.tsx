import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const Dashboard = async () => {
  // Get the token from cookies (server-side)
  const cookieStore = cookies()
  const token = (await cookieStore).get('token')?.value

  if (!token) {
    // Redirect to login if token is missing
    redirect('/login')
  }

  // Optional: Validate the token
  const isValid = true // Replace with actual token validation logic
  if (!isValid) {
    redirect('/login')
  }

  // Mock user data (fetch this from your back-end)
  const user = { email: 'user@example.com' }

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
    </div>
  )
}

export default Dashboard
