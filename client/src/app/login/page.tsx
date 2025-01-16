import { cookies } from 'next/headers'

const LoginPage = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  if (token) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }

  const router = useRouter()

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    console.log(router)
    // document.cookie = "token=exampleToken; path=/;"
    // router.push('/dashboard')
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        {/* Your login form fields */}
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default LoginPage
