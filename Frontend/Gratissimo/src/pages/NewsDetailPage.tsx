import { useEffect, useState } from 'react'

type Article = {
  id: number
  createdAt: string
  title: string
  content: string
  author: string
  imageUrl: string | null
}

const apiUrl = import.meta.env.VITE_API_URL

function formatDate(date: string) {
  const value = new Date(date)
  return `d. ${value.getDate()}/${value.getMonth() + 1}-${String(value.getFullYear()).slice(-2)}`
}

function imageUrl(value: string | null) {
  if (!value) return null
  return value.startsWith('http') ? value : `${apiUrl}${value}`
}

function shuffle<T>(items: T[]) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = currentItem
  }

  return shuffled
}

function NewsDetailPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [location, setLocation] = useState(window.location.pathname)

  useEffect(() => {
    const updateLocation = () => setLocation(window.location.pathname)
    window.addEventListener('locationchange', updateLocation)
    window.addEventListener('popstate', updateLocation)
    return () => {
      window.removeEventListener('locationchange', updateLocation)
      window.removeEventListener('popstate', updateLocation)
    }
  }, [])

  useEffect(() => {
    fetch(`${apiUrl}/api/articles`)
      .then((response) => (response.ok ? response.json() : []))
      .then((items: Article[]) => setArticles(shuffle(items)))
      .catch(() => setArticles([]))
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location])

  const articleId = Number(location.split('/')[2])
  const selectedId = Number.isInteger(articleId) && articleId > 0 ? articleId : articles[0]?.id
  const selectedArticle = articles.find((article) => article.id === selectedId)
  const otherArticles = articles.filter((article) => article.id !== selectedId)

  function selectArticle(id: number) {
    window.history.pushState({}, '', `/news/${id}`)
    window.dispatchEvent(new Event('locationchange'))
  }

  return (
    <section className="news-detail">
      <div className="home-intro">
        <p>Vi hjælper dig på vej til dit næste frivillige job</p>
        <a href="#">Log ind eller opret dig</a>
      </div>

      {selectedArticle && (
        <article className="news-detail-article">
          {selectedArticle.imageUrl && (
            <img className="news-detail-image" src={imageUrl(selectedArticle.imageUrl) ?? undefined} alt="" />
          )}
          <div className="news-detail-copy">
            <h1>{selectedArticle.title}</h1>
            <p className="news-detail-meta">{formatDate(selectedArticle.createdAt)} - {selectedArticle.author}</p>
            <p className="news-detail-content">{selectedArticle.content}</p>
          </div>
        </article>
      )}

      <section className="other-news">
        <h2>Alle Nyheder</h2>
        <div className="other-news-grid">
          {otherArticles.map((article) => (
            <a className="other-news-card" href={`/news/${article.id}`} key={article.id} onClick={(event) => {
              event.preventDefault()
              selectArticle(article.id)
            }}>
              {article.imageUrl && <img src={imageUrl(article.imageUrl) ?? undefined} alt="" />}
              <span>{formatDate(article.createdAt)} - {article.author}</span>
              <h3>{article.title}</h3>
            </a>
          ))}
        </div>
      </section>
    </section>
  )
}

export default NewsDetailPage
