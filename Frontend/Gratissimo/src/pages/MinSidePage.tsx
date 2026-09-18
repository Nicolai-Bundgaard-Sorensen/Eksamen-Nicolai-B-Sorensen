import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { useAuth } from '../hooks/useAuth'
import backIcon from '../assets/icons/icons8-back-30.png'
import nextIcon from '../assets/icons/icons8-forward-30.png'

type Job = {
  id: number
  userId: number
  title: string
  description: string
  organization: string
  city: string
  createdAt: string
  region?: { name: string }
  workHome?: string
  workType?: { type: string }
  jobCategory?: { name: string | null }
}

type Favorite = {
  id: number
  jobListing: Job
}

const apiUrl = import.meta.env.VITE_API_URL
const jobsPerPage = 5

type Tab = 'listings' | 'favorites'

function formatDate(date: string) {
  const value = new Date(date)
  return `d. ${value.getDate()}/${value.getMonth() + 1}-${String(value.getFullYear()).slice(-2)}`
}

function MinSidePage() {
  const { accessToken, user, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('listings')
  const [jobs, setJobs] = useState<Job[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [error, setError] = useState('')
  const [listingsPage, setListingsPage] = useState(1)
  const [favoritesPage, setFavoritesPage] = useState(1)
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null)

  useEffect(() => {
    if (!accessToken || !user) return

    const headers = { Authorization: `Bearer ${accessToken}` }
    Promise.all([
      fetch(`${apiUrl}/api/job-listings`),
      fetch(`${apiUrl}/api/favorites`, { headers }),
    ])
      .then(async ([jobsResponse, favoritesResponse]) => {
        if (jobsResponse.ok) setJobs(await jobsResponse.json())
        if (favoritesResponse.ok) setFavorites(await favoritesResponse.json())
      })
      .catch(() => setError('Kunne ikke hente dine annoncer og favoritter.'))
  }, [accessToken, user])

  const ownJobs = useMemo(
    () => jobs.filter((job) => job.userId === user?.id),
    [jobs, user?.id],
  )

  const listingsPages = Math.max(1, Math.ceil(ownJobs.length / jobsPerPage))
  const favoritesPages = Math.max(1, Math.ceil(favorites.length / jobsPerPage))
  const visibleJobs = ownJobs.slice(
    (listingsPage - 1) * jobsPerPage,
    listingsPage * jobsPerPage,
  )
  const visibleFavorites = favorites.slice(
    (favoritesPage - 1) * jobsPerPage,
    favoritesPage * jobsPerPage,
  )

  function changePage(page: number, type: Tab) {
    if (type === 'listings') setListingsPage(page)
    else setFavoritesPage(page)
  }

  async function removeFavorite(favoriteId: number) {
    if (!accessToken) return

    const response = await fetch(`${apiUrl}/api/favorites/${favoriteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (response.ok) {
      setFavorites((current) => current.filter((favorite) => favorite.id !== favoriteId))
    }
  }

  function handleLogout(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    logout().then(() => {
      window.history.pushState({}, '', '/login')
      window.dispatchEvent(new Event('locationchange'))
    })
  }

  return (
    <section className="my-page">
      <header className="my-page-header">
        <h1>Velkommen {user?.firstname}</h1>
        <p>Rediger eller slet dine annoncer. Du kan også danne dig et overblik over de annoncer du har gemt som favorit, samt fjerne dem igen</p>
        <div className="my-page-links">
          <a href="/login" onClick={handleLogout}>Log ud</a>
          <a href="#">Rediger Profil</a>
        </div>
      </header>

      <div className="my-page-tabs">
        <button className={tab === 'listings' ? 'active' : ''} type="button" onClick={() => setTab('listings')}>
          Mine annoncer
        </button>
        <button className={tab === 'favorites' ? 'active' : ''} type="button" onClick={() => setTab('favorites')}>
          Mine favoritter
        </button>
      </div>

      {error && <p className="my-page-error">{error}</p>}

      <div className="my-page-list">
        {tab === 'listings' && visibleJobs.map((job) => (
          <article className={`result-card ${expandedJobId === job.id ? 'expanded' : ''}`} key={job.id}>
            <div className="result-card-main">
              <p className="result-company">{job.organization}</p>
              <h2>{job.title}</h2>
              {expandedJobId === job.id && <p className="result-category">{job.jobCategory?.name ?? 'Kategori'}</p>}
              <p className="result-description">{job.description}</p>
              {expandedJobId === job.id && (
                <div className="result-expanded-details">
                  <div><strong>Beskrivelse</strong><p>{job.description}</p></div>
                </div>
              )}
            </div>
            <div className="result-card-side">
              <p>Lokation: {job.region?.name ?? job.city}</p>
              <p>Indrykket: {formatDate(job.createdAt)}</p>
              {expandedJobId === job.id && <>
                <p>Arbejdstid: {job.workType?.type ?? 'Ikke oplyst'}</p>
                <p>Hjemmearbejde: {job.workHome ?? 'Ikke oplyst'}</p>
              </>}
              <div className="result-actions">
                <button className="danger-action" type="button">Slet</button>
                <button type="button" onClick={() => setExpandedJobId((id) => id === job.id ? null : job.id)}>
                  {expandedJobId === job.id ? 'Luk' : 'Åben'}
                </button>
              </div>
            </div>
          </article>
        ))}

        {tab === 'favorites' && visibleFavorites.map((favorite) => (
          <article className={`result-card ${expandedJobId === favorite.jobListing.id ? 'expanded' : ''}`} key={favorite.id}>
            <div className="result-card-main">
              <p className="result-company">{favorite.jobListing.organization}</p>
              <h2>{favorite.jobListing.title}</h2>
              {expandedJobId === favorite.jobListing.id && <p className="result-category">{favorite.jobListing.jobCategory?.name ?? 'Kategori'}</p>}
              <p className="result-description">{favorite.jobListing.description}</p>
              {expandedJobId === favorite.jobListing.id && (
                <div className="result-expanded-details">
                  <div><strong>Beskrivelse</strong><p>{favorite.jobListing.description}</p></div>
                </div>
              )}
            </div>
            <div className="result-card-side">
              <p>Lokation: {favorite.jobListing.region?.name ?? favorite.jobListing.city}</p>
              <p>Indrykket: {formatDate(favorite.jobListing.createdAt)}</p>
              {expandedJobId === favorite.jobListing.id && <>
                <p>Arbejdstid: {favorite.jobListing.workType?.type ?? 'Ikke oplyst'}</p>
                <p>Hjemmearbejde: {favorite.jobListing.workHome ?? 'Ikke oplyst'}</p>
              </>}
              <div className="result-actions">
                <button className="danger-action" type="button" onClick={() => removeFavorite(favorite.id)}>Fjern</button>
                <button type="button" onClick={() => setExpandedJobId((id) => id === favorite.jobListing.id ? null : favorite.jobListing.id)}>
                  {expandedJobId === favorite.jobListing.id ? 'Luk' : 'Åben'}
                </button>
              </div>
            </div>
          </article>
        ))}

        {tab === 'listings' && !ownJobs.length && <p className="my-page-empty">Du har ingen annoncer endnu.</p>}
        {tab === 'favorites' && !favorites.length && <p className="my-page-empty">Du har ingen favoritter endnu.</p>}

        {tab === 'listings' && (
          <Pagination
            page={listingsPage}
            pages={listingsPages}
            onChange={(page) => changePage(page, 'listings')}
          />
        )}
        {tab === 'favorites' && (
          <Pagination
            page={favoritesPage}
            pages={favoritesPages}
            onChange={(page) => changePage(page, 'favorites')}
          />
        )}
      </div>
    </section>
  )
}

type PaginationProps = {
  page: number
  pages: number
  onChange: (page: number) => void
}

function Pagination({ page, pages, onChange }: PaginationProps) {
  return (
    <nav className="my-page-pagination">
      <button type="button" onClick={() => onChange(Math.max(1, page - 1))}>
        <img src={backIcon} alt="Forrige side" />
      </button>
      {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
        <button
          className={number === page ? 'active' : ''}
          type="button"
          key={number}
          onClick={() => onChange(number)}
        >
          {number}
        </button>
      ))}
      <button type="button" onClick={() => onChange(Math.min(pages, page + 1))}>
        <img src={nextIcon} alt="Næste side" />
      </button>
    </nav>
  )
}

export default MinSidePage
