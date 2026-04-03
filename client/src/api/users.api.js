import http from './http'

export const getMe = () =>
  http.get('/users/me').then((r) => r.data)

export const updateMe = (data) =>
  http.put('/users/me', data).then((r) => r.data)

export const uploadLogo = (file) => {
  const form = new FormData()
  form.append('file', file)
  return http.post('/users/me/logo', form).then((r) => r.data)
}

export const uploadSign = (file) => {
  const form = new FormData()
  form.append('file', file)
  return http.post('/users/me/sign', form).then((r) => r.data)
}
