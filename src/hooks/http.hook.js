import { useState, useCallback } from 'react'

export const useFetch = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
    setLoading(true)
    try {
      if(body) {
        body = JSON.stringify(body)
        headers['Content-type'] = 'application/json'
      }
      const res = await fetch(url, { method, body, headers })
      const data = await res.json()

      if (!res.ok) {
        // TODO: обработать ошибку
        console.log(res.message)
      }

      setLoading(false)
      return {
        data,
        status: res.status,
        statusText: res.statusText,
        url: res.url,
      }
    } catch (error) {
      setError(error)
      setLoading(false)
    }
  })

  const clearError = useCallback(() => setError(null), [])
  return { loading, error, request, clearError }
}
