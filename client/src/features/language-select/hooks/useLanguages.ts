import { useState, useEffect } from 'react'

export type Language = {
  code: string
  name: string
  members: number
  learners: number
  helpers: number
}

const MOCK_LANGUAGES: Language[] = [
  { code: 'ES', name: 'Spanish', members: 8200, learners: 6100, helpers: 2100 },
  { code: 'FR', name: 'French', members: 5900, learners: 4200, helpers: 1700 },
  { code: 'JP', name: 'Japanese', members: 7700, learners: 6000, helpers: 1700 },
  { code: 'CN', name: 'Mandarin', members: 6400, learners: 5100, helpers: 1300 },
  { code: 'DE', name: 'German', members: 3900, learners: 3000, helpers: 911 },
  { code: 'BR', name: 'Portuguese', members: 4100, learners: 3200, helpers: 920 },
  { code: 'SA', name: 'Arabic', members: 3300, learners: 2600, helpers: 740 },
  { code: 'KR', name: 'Korean', members: 5900, learners: 4800, helpers: 1100 },
]

export function useLanguages() {
  const [data, setData] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [error, _setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function fetchLanguages() {
      try {
        const res = await fetch('/api/languages')
        if (res.ok) {
          const json = await res.json() as Language[]
          if (!cancelled) setData(json)
        } else {
          // Fall back to mock data if API not available
          if (!cancelled) setData(MOCK_LANGUAGES)
        }
      } catch {
        // Use mock data when server is not available
        if (!cancelled) setData(MOCK_LANGUAGES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchLanguages()
    return () => { cancelled = true }
  }, [])

  return { data, loading, error }
}
