import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'

type Favorite = {
  id: number
  jobListingId: number
}

const apiUrl = import.meta.env.VITE_API_URL

export function useFavorites() {
  const { accessToken, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!accessToken || !isAuthenticated) return

    fetch(`${apiUrl}/api/favorites`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then(setFavorites)
      .catch(() => setFavorites([]))
  }, [accessToken, isAuthenticated])

  function isFavorite(jobListingId: number) {
    return favorites.some((favorite) => favorite.jobListingId === jobListingId)
  }

  async function saveFavorite(jobListingId: number) {
    if (!isAuthenticated || !accessToken) {
      setMessage('Du skal logge ind for at gemme en annonce.')
      return
    }

    if (isFavorite(jobListingId)) return

    const response = await fetch(`${apiUrl}/api/favorites`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ jobListingId: String(jobListingId) }),
    })

    if (response.ok) {
      const favorite = await response.json()
      setFavorites((current) => [...current, favorite])
      setMessage('Annoncen er gemt i dine favoritter.')
      return
    }

    const data = await response.json().catch(() => ({}))
    setMessage(data.error ?? 'Annoncen kunne ikke gemmes.')
  }

  return { favorites, isFavorite, saveFavorite, message }
}
