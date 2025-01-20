'use client'

import { useAuth } from '@/stores/user'
import { useState } from 'react'

const Register = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div>
      <h1>Register</h1>
      <form>
        <div>
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" required />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="text" id="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="text" id="password" required />
        </div>
      </form>
    </div>
  )
}

export default Register
