import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// function to check if user is authenticated
const isAuthenticated = (req: NextRequest) => {
  const token = req.cookies.get('token')

  return token ? true : false
}

export function authenticationMiddleware(req: NextRequest) {
  // check if user is authenticated
  if (req.nextUrl.pathname === '/dashboard' && !isAuthenticated(req)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

// middleware will run for specific paths that you want to protect
export const config = {
  matched: ['/dashboard'],
}
