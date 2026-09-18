import { useEffect, useMemo, useState } from "react";
import SearchControls from "../components/SearchControls";
import { useFavorites } from "../hooks/useFavorites";
import favoriteIcon from "../assets/icons/icons8-favorite-50.png";
import openIcon from "../assets/icons/icons8-forward-30.png";
import backIcon from "../assets/icons/icons8-back-30.png";
import nextIcon from "../assets/icons/icons8-forward-30.png";

type JobListing = {
  id: number;
  title: string;
  description: string;
  organization: string;
  city: string;
  createdAt: string;
  workHome: string;
  region?: { name: string };
  workType?: { type: string };
  jobCategory?: { name: string | null };
};

type Region = {
  id: number;
  name: string;
};

type JobCategory = {
  id: number;
  name: string | null;
};

type WorkType = {
  id: number;
  type: string;
};

const apiUrl = import.meta.env.VITE_API_URL;
const jobsPerPage = 5;
const visiblePageCount = 8;

function formatDate(date: string) {
  const value = new Date(date);
  return `d. ${value.getDate()}/${value.getMonth() + 1}-${String(value.getFullYear()).slice(-2)}`;
}

function matchesPeriodFilter(createdAt: string, period: string) {
  const createdDate = new Date(createdAt).getTime();
  const now = Date.now();
  const periodLength = {
    "Seneste uge": 7,
    "Seneste måned": 30,
    "Seneste år": 365,
  }[period];

  return (
    periodLength === undefined ||
    now - createdDate <= periodLength * 24 * 60 * 60 * 1000
  );
}

function SearchResultsPage() {
  const [searchParams, setSearchParams] = useState(window.location.search);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const { isFavorite, saveFavorite, message: favoriteMessage } = useFavorites();

  const params = new URLSearchParams(searchParams);
  const query = params.get("q")?.trim() ?? "";

  useEffect(() => {
    const updateSearch = () => setSearchParams(window.location.search);
    window.addEventListener("locationchange", updateSearch);
    window.addEventListener("popstate", updateSearch);
    return () => {
      window.removeEventListener("locationchange", updateSearch);
      window.removeEventListener("popstate", updateSearch);
    };
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${apiUrl}/api/job-listings`),
      fetch(`${apiUrl}/api/regions`),
      fetch(`${apiUrl}/api/job-categories`),
      fetch(`${apiUrl}/api/workTypes`),
    ])
      .then(
        async ([
          jobsResponse,
          regionsResponse,
          categoriesResponse,
          workTypesResponse,
        ]) => {
          if (jobsResponse.ok) setJobs(await jobsResponse.json());
          if (regionsResponse.ok) setRegions(await regionsResponse.json());
          if (categoriesResponse.ok)
            setCategories(await categoriesResponse.json());
          if (workTypesResponse.ok)
            setWorkTypes(await workTypesResponse.json());
        },
      )
      .catch(() => {
        setJobs([]);
        setRegions([]);
        setCategories([]);
        setWorkTypes([]);
      });
  }, []);

  const results = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const query = params.get("q")?.trim() ?? "";
    const search = query.toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        `${job.title} ${job.description}`.toLowerCase().includes(search);
      const matchesRegion =
        !params.get("region") || job.region?.name === params.get("region");
      const matchesCategory =
        !params.get("category") ||
        job.jobCategory?.name === params.get("category");
      const matchesWorkType =
        !params.get("workType") ||
        job.workType?.type === params.get("workType");
      const matchesWorkHome =
        !params.get("workHome") || job.workHome === params.get("workHome");
      const matchesPeriod =
        !params.get("period") ||
        matchesPeriodFilter(job.createdAt, params.get("period") ?? "");

      return (
        matchesSearch &&
        matchesRegion &&
        matchesCategory &&
        matchesWorkType &&
        matchesWorkHome &&
        matchesPeriod
      );
    });
  }, [jobs, searchParams]);

  const filterOptions = {
    region: regions.map((region) => region.name),
    category: categories.map((category) => category.name ?? "").filter(Boolean),
    workType: workTypes.map((workType) => workType.type),
    workHome: [...new Set(jobs.map((job) => job.workHome).filter(Boolean))],
  };

  const requestedPage = Math.max(1, Number(params.get("page")) || 1);
  const totalPages = Math.ceil(results.length / jobsPerPage);
  const currentPage = Math.min(requestedPage, Math.max(totalPages, 1));
  const visibleResults = results.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage,
  );
  const firstVisiblePage = Math.min(
    Math.max(1, currentPage - visiblePageCount + 1),
    Math.max(1, totalPages - visiblePageCount + 1),
  );
  const lastVisiblePage = Math.min(
    totalPages,
    firstVisiblePage + visiblePageCount - 1,
  );

  function changePage(page: number) {
    const nextParams = new URLSearchParams(searchParams);
    if (page === 1) nextParams.delete("page");
    else nextParams.set("page", String(page));

    const queryString = nextParams.toString();
    window.history.pushState(
      {},
      "",
      queryString ? `/search-results?${queryString}` : "/search-results",
    );
    window.dispatchEvent(new Event("locationchange"));
  }

  return (
    <section>
      <SearchControls
        key={searchParams}
        initialQuery={query}
        options={filterOptions}
      />
      <div className="results-list">
        {favoriteMessage && (
          <p className="favorite-message">{favoriteMessage}</p>
        )}
        {visibleResults.map((job) => (
          <article
            className={`result-card ${expandedJobId === job.id ? "expanded" : ""}`}
            key={job.id}
          >
            <div className="result-card-main">
              <p className="result-company">{job.organization}</p>
              <h2>{job.title}</h2>
              {expandedJobId === job.id && (
                <p className="result-category">
                  {job.jobCategory?.name ?? "Kategori"}
                </p>
              )}
              <p className="result-description">{job.description}</p>
              {expandedJobId === job.id && (
                <div className="result-expanded-details">
                  <div>
                    <strong>Beskrivelse</strong>
                    <p>{job.description}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="result-card-side">
              <p>Lokation: {job.region?.name ?? job.city}</p>
              <p>Indrykket: {formatDate(job.createdAt)}</p>
              {expandedJobId === job.id && (
                <>
                  <p>Arbejdstid: {job.workType?.type ?? "Ikke oplyst"}</p>
                  <p>Hjemmearbejde: {job.workHome}</p>
                  <div className="result-contact">
                    <strong>Kontakt</strong>
                    <p>{job.organization}</p>
                  </div>
                </>
              )}
              <div className="result-actions">
                <button
                  className={isFavorite(job.id) ? "favorite-saved" : ""}
                  type="button"
                  onClick={() => saveFavorite(job.id)}
                >
                  Gem
                  <img src={favoriteIcon} alt="" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedJobId((id) => (id === job.id ? null : job.id))
                  }
                >
                  <img src={openIcon} alt="" />
                  {expandedJobId === job.id ? "Luk" : "Åben"}
                </button>
              </div>
            </div>
          </article>
        ))}
        {!results.length && <p className="empty-results">Ingen jobs fundet.</p>}
        {totalPages > 1 && (
          <nav className="results-pagination">
            <button
              className="pagination-arrow"
              type="button"
              onClick={() => changePage(Math.max(1, currentPage - 1))}
            >
              <img src={backIcon} alt="Forrige side" />
            </button>
            {Array.from(
              { length: lastVisiblePage - firstVisiblePage + 1 },
              (_, index) => firstVisiblePage + index,
            ).map((page) => (
              <button
                className={page === currentPage ? "active" : ""}
                type="button"
                key={page}
                onClick={() => changePage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-arrow"
              type="button"
              onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
            >
              <img src={nextIcon} alt="Næste side" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}

export default SearchResultsPage;
