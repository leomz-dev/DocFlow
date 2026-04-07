import http from './http'

export const googleLogin = (credential) =>
  http.post('/auth/google', { credential }).then((r) => r.data)
