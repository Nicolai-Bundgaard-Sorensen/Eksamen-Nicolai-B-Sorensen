import { useEffect, useState } from "react";
import type { FormEvent, MouseEvent } from "react";
import "./styles/main.scss";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import AuthPage from "./pages/AuthPage";
import CreateJobPage from "./pages/CreateJobPage";
import MinSidePage from "./pages/MinSidePage";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import logoWhite from "./assets/logo/logo-white.png";
import facebookIcon from "./assets/icons/SoMe/Facebook.png";
import googlePlusIcon from "./assets/icons/SoMe/Google Plus.png";
import instagramIcon from "./assets/icons/SoMe/Instagram Circle.png";
import linkedInIcon from "./assets/icons/SoMe/LinkedIn Circled.png";

const footerColumns = [
  {
    title: "For jobsøgere",
    links: [
      ["Din kundeside", "/min-side"],
      ["Opret Profil", "/login?mode=register"],
      ["Gemte jobs", "/min-side?tab=favorites"],
    ],
  },
  {
    title: "For arbejdsgivere",
    links: [
      ["Virksomhedsprofil", "#"],
      ["Opret annonce", "/opret-annonce"],
      ["Jobannoncering", "#"],
      ["Rekruttering", "#"],
    ],
  },
  {
    title: "Links",
    links: [
      ["Om Gratissimo", "#"],
      ["Job hos os", "#"],
      ["For investorer", "#"],
      ["Presse", "#"],
    ],
  },
];

const socialLinks = [
  { name: "LinkedIn", icon: linkedInIcon },
  { name: "Facebook", icon: facebookIcon },
  { name: "Instagram", icon: instagramIcon },
  { name: "Google Plus", icon: googlePlusIcon },
];

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const [location, setLocation] = useState(window.location.href);
  const currentUrl = new URL(location);
  const currentPath = currentUrl.pathname;
  const isRegisterPage =
    currentPath === "/login" &&
    currentUrl.searchParams.get("mode") === "register";
  const { isAuthenticated, accessToken, logout } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterError, setNewsletterError] = useState("");

  function handleLogout(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    logout().then(() => {
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new Event("locationchange"));
    });
  }

  useEffect(() => {
    const updateLocation = () => setLocation(window.location.href);
    window.addEventListener("locationchange", updateLocation);
    window.addEventListener("popstate", updateLocation);
    return () => {
      window.removeEventListener("locationchange", updateLocation);
      window.removeEventListener("popstate", updateLocation);
    };
  }, []);

  const page = currentPath.startsWith("/search-results") ? (
    <SearchResultsPage />
  ) : currentPath.startsWith("/news") ? (
    <NewsDetailPage />
  ) : currentPath === "/login" ? (
    <AuthPage />
  ) : currentPath === "/opret-annonce" ? (
    <CreateJobPage />
  ) : currentPath === "/min-side" ? (
    <MinSidePage />
  ) : (
    <HomePage />
  );

  function goToMyPage(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.history.pushState({}, "", "/min-side");
    window.dispatchEvent(new Event("locationchange"));
  }

  async function subscribeToNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterMessage("");
    setNewsletterError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      setNewsletterError("Indtast en gyldig emailadresse.");
      return;
    }

    if (!accessToken) {
      setNewsletterError(
        "Du skal være logget ind for at tilmelde dig nyhedsbrevet.",
      );
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/newsletter`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ email: newsletterEmail }),
        },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setNewsletterError(data.error ?? "Tilmelding kunne ikke gennemføres.");
        return;
      }

      setNewsletterEmail("");
      setNewsletterMessage("Du er nu tilmeldt nyhedsbrevet.");
    } catch {
      setNewsletterError("Der kunne ikke oprettes forbindelse til serveren.");
    }
  }

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
            <a
              className={
                currentPath === "/" || currentPath === "/search-results"
                  ? "active"
                  : ""
              }
              href="/search-results"
            >
              Alle Jobs
            </a>
            <a
              className={currentPath === "/opret-annonce" ? "active" : ""}
              href="/opret-annonce"
            >
              Opret annonce
            </a>
            <a
              className={currentPath.startsWith("/news") ? "active" : ""}
              href="/news"
            >
              Nyheder
            </a>
          </div>

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <a
                  className={currentPath === "/min-side" ? "active" : ""}
                  href="/min-side"
                  onClick={goToMyPage}
                >
                  Min side
                </a>
                <a href="/" onClick={handleLogout}>
                  Log ud
                </a>
              </>
            ) : (
              <>
                <a
                  className={isRegisterPage ? "active" : ""}
                  href="/login?mode=register"
                >
                  Opret Profil
                </a>
                <a
                  className={
                    currentPath === "/login" && !isRegisterPage ? "active" : ""
                  }
                  href="/login"
                >
                  Log ind
                </a>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="page-content">{page}</main>

      <footer className="site-footer">
        <div className="footer-inner">
          {footerColumns.map((column) => (
            <div className="footer-column" key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-column footer-contact">
            <h3>Vil du have jobs direkte i din indbakke?</h3>
            <p>Tilmed dig vores elektroniske nyhedsbrev</p>
            <form className="newsletter" onSubmit={subscribeToNewsletter}>
              <input
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Indtast email..."
              />
              <button type="submit">Tilmeld</button>
            </form>
            {newsletterError && (
              <p className="newsletter-message error">{newsletterError}</p>
            )}
            {newsletterMessage && (
              <p className="newsletter-message success">{newsletterMessage}</p>
            )}
          </div>

          <div className="footer-column footer-meta">
            <p className="address">
              Fidusvej 23
              <br />
              9230 Øster Lundby
              <br />
              +45 22 13 22 13
            </p>
            <div className="socials">
              {socialLinks.map((social) => (
                <a href="#" key={social.name}>
                  <img src={social.icon} alt={social.name} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
