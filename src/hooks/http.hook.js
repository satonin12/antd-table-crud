import { useState, useEffect } from 'react'

const useFetch = (url, method = 'GET') => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(url, { method })
        const data = await res.json()

        setData(data)
        setLoading(false)
      } catch (error) {
        setError(error)
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { loading, data, error }
}

export default useFetch
