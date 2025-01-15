export const apiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN || window.location.origin
export const apiPath = process.env.NEXT_PUBLIC_API_PATH || '/api/v1/trpc'
export const apiBase = `${apiOrigin}${apiPath}`

if (typeof apiOrigin !== 'string') {
  throw new Error('NEXT_PUBLIC_API_ORIGIN is not defined')
}

if (typeof apiPath !== 'string') {
  throw new Error('NEXT_PUBLIC_API_PATH is not defined')
}
