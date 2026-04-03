import { useState, useCallback } from 'react'
import * as documentsApi from '@/api/documents.api'

/**
 * Manages document generation state:
 * - triggers generate API call
 * - stores the resulting PDF blob URL for preview
 * - tracks loading and error states
 */
export function useDocument() {
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)
  const [docEntry,   setDocEntry]   = useState(null)

  const generate = useCallback(async (payload) => {
    setLoading(true)
    setError(null)
    setPdfBlobUrl(null)
    try {
      const blob = await documentsApi.generate(payload)
      const url  = URL.createObjectURL(blob)
      setPdfBlobUrl(url)
      // Extract doc metadata from response headers is not accessible via axios blob,
      // so we refresh history separately.
      return url
    } catch (err) {
      const msg = err.response?.data?.error || 'Error generando el documento'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearPreview = useCallback(() => {
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl)
    setPdfBlobUrl(null)
    setDocEntry(null)
    setError(null)
  }, [pdfBlobUrl])

  return { generate, loading, error, pdfBlobUrl, docEntry, clearPreview }
}
