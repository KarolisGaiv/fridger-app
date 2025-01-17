import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function authMiddleware(req: NextRequest) {
  // get token from cookies
  const token = req.cookies.get('token')?.value

  if (!token) {
    // redirect to login if no token does not exist
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // validate token
  const isValid = true
  if (!isValid) {
    // clear invalid token and redirect to login
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('token')
    return res
  }

  return NextResponse.next()
}

// define routes which should be protected
export const config = {
  matcher: ['/dashboard'],
}
