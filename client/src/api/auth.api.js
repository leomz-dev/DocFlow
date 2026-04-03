import http from './http'

export const login = (email, password) =>
  http.post('/auth/login', { email, password }).then((r) => r.data)

export const refresh = () =>
  http.post('/auth/refresh').then((r) => r.data)
