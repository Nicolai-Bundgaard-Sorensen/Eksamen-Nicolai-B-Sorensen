import './styles/main.scss'

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <a href="/" className="brand">
            <span className="brand-mark">
              <span className="brand-dot" />
            </span>
            <span className="brand-copy">
              <span className="brand-name">Gratissimo</span>
              <span className="brand-tagline">FIND DIT NÆSTE FRIVILLIGE JOB</span>
            </span>
          </a>
        </div>

        <nav className="main-nav">
          <div className="nav-links">
            <a href="#">Alle Jobs</a>
            <a href="#">Opret annonce</a>
            <a href="#">Nyheder</a>
          </div>

          <div className="nav-actions">
            <a href="#">Opret Profil</a>
            <a href="#">Log ind</a>
          </div>
        </nav>
      </header>

      <main className="page-content">
        <div className="content-slot" />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-column">
            <h3>For jobsøgere</h3>
            <ul>
              <li><a href="#">Din kundeservice</a></li>
              <li><a href="#">Opret profil</a></li>
              <li><a href="#">Gemte jobs</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>For arbejdsgivere</h3>
            <ul>
              <li><a href="#">Virksomhedsprofil</a></li>
              <li><a href="#">Opret annonce</a></li>
              <li><a href="#">Rekruttering</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Links</h3>
            <ul>
              <li><a href="#">Om Gratissimo</a></li>
              <li><a href="#">Job hos os</a></li>
              <li><a href="#">Pressen</a></li>
            </ul>
          </div>

          <div className="footer-column footer-contact">
            <h3>Vil du have jobs direkte i din indbakke?</h3>
            <p>Tilmed dig vores elektroniske nyhedsbrev</p>
          </div>

          <div className="footer-column footer-meta">
            <h3>Følg os</h3>
            <div className="socials">
              <span className="social-badge">in</span>
              <span className="social-badge">f</span>
              <span className="social-badge">G</span>
            </div>
            <p className="phone">+45 22 13 22 13</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
