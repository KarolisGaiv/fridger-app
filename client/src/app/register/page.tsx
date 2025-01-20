'use client'

import { useAuth } from '@/stores/user'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const Register = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const { signup } = useAuth()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    try {
      await signup({ email, password, firstName, lastName })
      router.push('/login')
    } catch (error) {
      let message
      if (error instanceof Error) message = error.message
      console.error(message)
    }
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            required
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" required onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="text" id="email" required onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="text" id="password" required onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default Register
