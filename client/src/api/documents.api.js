import http from './http'

/**
 * Generate a document PDF.
 * Returns a Blob (PDF).
 */
export const generate = (payload) =>
  http.post('/documents/generate', payload, { responseType: 'blob' }).then((r) => ({
    blob: r.data,
    number: r.headers['x-doc-number']
  }))

export const getHistory = () =>
  http.get('/documents/history').then((r) => r.data)

export const download = (id) =>
  http.get(`/documents/${id}/download`, { responseType: 'blob' }).then((r) => r.data)

export const remove = (id) =>
  http.delete(`/documents/${id}`).then((r) => r.data)
