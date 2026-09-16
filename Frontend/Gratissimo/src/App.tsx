import { useEffect, useState } from 'react'
import './styles/main.scss'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import NewsDetailPage from './pages/NewsDetailPage'
import logoWhite from './assets/logo/logo-white.png'
import facebookIcon from './assets/icons/SoMe/Facebook.png'
import googlePlusIcon from './assets/icons/SoMe/Google Plus.png'
import instagramIcon from './assets/icons/SoMe/Instagram Circle.png'
import linkedInIcon from './assets/icons/SoMe/LinkedIn Circled.png'

function App() {
  const [location, setLocation] = useState(window.location.href)
  const currentPath = new URL(location).pathname

  useEffect(() => {
    const updateLocation = () => setLocation(window.location.href)
    window.addEventListener('locationchange', updateLocation)
    window.addEventListener('popstate', updateLocation)
    return () => {
      window.removeEventListener('locationchange', updateLocation)
      window.removeEventListener('popstate', updateLocation)
    }
  }, [])

  const page = currentPath.startsWith('/search-results')
    ? <SearchResultsPage />
    : currentPath.startsWith('/news')
      ? <NewsDetailPage />
      : <HomePage />

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a href="/" className="brand">
            <img src={logoWhite} alt="Gratissimo" />
          </a>
        </div>

        <nav className="main-nav">
          <div className="nav-links">
            <a className={currentPath === '/' ? 'active' : ''} href="/">Alle Jobs</a>
            <a href="#">Opret annonce</a>
            <a className={currentPath.startsWith('/news') ? 'active' : ''} href="/news">Nyheder</a>
          </div>

          <div className="nav-actions">
            <a href="#">Opret Profil</a>
            <a href="#">Log ind</a>
          </div>
        </nav>
      </header>

      <main className="page-content">
        {page}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-column">
            <h3>For jobsøgere</h3>
            <ul>
              <li><a href="#">Din kundeside</a></li>
              <li><a href="#">Opret Profil</a></li>
              <li><a href="#">Gemte jobs</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>For arbejdsgivere</h3>
            <ul>
              <li><a href="#">Virksomhedsprofil</a></li>
              <li><a href="#">Opret annonce</a></li>
              <li><a href="#">Jobannoncering</a></li>
              <li><a href="#">Rekruttering</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Links</h3>
            <ul>
              <li><a href="#">Om Gratissimo</a></li>
              <li><a href="#">Job hos os</a></li>
              <li><a href="#">For investorer</a></li>
              <li><a href="#">Presse</a></li>
            </ul>
          </div>

          <div className="footer-column footer-contact">
            <h3>Vil du have jobs direkte i din indbakke?</h3>
            <p>Tilmed dig vores elektroniske nyhedsbrev</p>
            <form className="newsletter" onSubmit={(event) => event.preventDefault()}>
              <input type="email" placeholder="Indtast email..." />
              <button type="submit">Tilmeld</button>
            </form>
          </div>

          <div className="footer-column footer-meta">
            <p className="address">Fidusvej 23<br />9230 Øster Lundby<br />+45 22 13 22 13</p>
            <div className="socials">
              <a href="#"><img src={linkedInIcon} alt="LinkedIn" /></a>
              <a href="#"><img src={facebookIcon} alt="Facebook" /></a>
              <a href="#"><img src={instagramIcon} alt="Instagram" /></a>
              <a href="#"><img src={googlePlusIcon} alt="Google Plus" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
