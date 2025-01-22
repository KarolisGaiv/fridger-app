import { useUserStore } from '@/stores/user'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const login = useUserStore((state) => state.login)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login({ email, password })
      console.log('user logged in')
      navigate('/dashboard')
      console.log('redirected to dashboard')
    } catch (error) {
      let message
      if (error instanceof Error) message = error.message
      console.error(message)
      setError(message || 'Something went wrong')
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <div>
        Not a member?{' '}
        <button type="button" onClick={() => navigate('/register')}>
          Register
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
