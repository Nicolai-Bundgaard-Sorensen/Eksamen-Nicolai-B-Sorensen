import { useEffect, useState } from 'react'
import SearchControls from '../components/SearchControls'

type JobCategory = {
  id: number
  name: string | null
}

type JobListing = {
  jobCategoryId: number
  workHome: string
  region?: { name: string }
  workType?: { type: string }
}

type Region = {
  id: number
  name: string
}

type WorkType = {
  id: number
  type: string
}

type Article = {
  id: number
  createdAt: string
  title: string
  content: string
  author: string
  imageUrl: string | null
}

type Testimony = {
  id: number
  name: string
  content: string
}

const apiUrl = import.meta.env.VITE_API_URL

function excerpt(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length).trim()}...` : text
}

function formatDate(date: string) {
  const value = new Date(date)
  return `d. ${value.getDate()}/${value.getMonth() + 1}`
}

function articleImageUrl(imageUrl: string) {
  return imageUrl.startsWith('http') ? imageUrl : `${apiUrl}${imageUrl}`
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

function HomePage() {
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [testimonyIndex, setTestimonyIndex] = useState(0)

  useEffect(() => {
    async function loadHomepageData() {
      const [
        categoryResponse,
        jobResponse,
        regionResponse,
        workTypeResponse,
        articleResponse,
        testimonyResponse,
      ] = await Promise.all([
        fetch(`${apiUrl}/api/job-categories`),
        fetch(`${apiUrl}/api/job-listings`),
        fetch(`${apiUrl}/api/regions`),
        fetch(`${apiUrl}/api/workTypes`),
        fetch(`${apiUrl}/api/articles`),
        fetch(`${apiUrl}/api/testimony`),
      ])

      if (categoryResponse.ok) setCategories(await categoryResponse.json())
      if (jobResponse.ok) setJobListings(await jobResponse.json())
      if (regionResponse.ok) setRegions(await regionResponse.json())
      if (workTypeResponse.ok) setWorkTypes(await workTypeResponse.json())
      if (articleResponse.ok) setArticles(shuffle(await articleResponse.json()))
      if (testimonyResponse.ok) setTestimonies(await testimonyResponse.json())
    }

    loadHomepageData().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (testimonies.length < 2) return

    const interval = window.setInterval(() => {
      setTestimonyIndex((index) => (index + 1) % testimonies.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [testimonies.length])

  const jobCountByCategory = jobListings.reduce<Record<number, number>>((counts, job) => {
    counts[job.jobCategoryId] = (counts[job.jobCategoryId] ?? 0) + 1
    return counts
  }, {})

  const filterOptions = {
    region: regions.map((region) => region.name),
    category: categories.map((category) => category.name ?? '').filter(Boolean),
    workType: workTypes.map((workType) => workType.type),
    workHome: [...new Set(jobListings.map((job) => job.workHome).filter(Boolean))],
  }

  return (
    <section className="home-top">
      <div className="home-intro">
        <p>Vi hjælper dig på vej til dit næste frivillige job</p>
        <a href="#">Log ind eller opret dig</a>
      </div>

      <SearchControls options={filterOptions} />

      <section className="home-section">
        <h2>Find job ved kategori</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <a className="category-card" href="#" key={category.id}>
              <span className="category-name">{category.name}</span>
              <span className="category-count">{jobCountByCategory[category.id] ?? 0}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="home-section news-section">
        <h2>Udvalgte nyheder</h2>
        <div className="news-grid">
          {articles.slice(0, 3).map((article) => (
            <article className="news-card" key={article.id}>
              {article.imageUrl && <img src={articleImageUrl(article.imageUrl)} alt="" />}
              <div className="news-card-content">
                <p>{formatDate(article.createdAt)} - {article.author}</p>
                <h3>{article.title}</h3>
                <span>{excerpt(article.content, 110)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section testimonials-section">
        <h2>Gratissimo hjalp mig tilbage i arbejde</h2>
        <div>
          {testimonies[testimonyIndex] && (
            <article className="testimonial" key={testimonies[testimonyIndex].id}>
              <p>{excerpt(testimonies[testimonyIndex].content, 220)}</p>
              <h3>{testimonies[testimonyIndex].name}</h3>
            </article>
          )}
        </div>
        <div className="testimonial-dots">
          {testimonies.map((testimony, index) => (
            <span className={index === testimonyIndex ? 'active' : ''} key={testimony.id} />
          ))}
        </div>
      </section>
    </section>
  )
}

export default HomePage
