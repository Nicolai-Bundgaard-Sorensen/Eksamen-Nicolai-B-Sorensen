import { useState } from 'react'
import type { FormEvent } from 'react'
import searchIcon from '../assets/icons/icons8-search-50.png'

type SearchControlsProps = {
  initialQuery?: string
  options?: Record<string, string[]>
}

const filters = [
  { name: 'region', options: ['Region'] },
  { name: 'category', options: ['Kategori'] },
  { name: 'workType', options: ['Arbejdstid', 'Deltid', 'Fuldtid', 'Flex'] },
  { name: 'period', options: ['Periode', 'Seneste uge', 'Seneste måned', 'Seneste år'] },
  { name: 'workHome', options: ['Hjemmearbejde', 'On-site', 'Delvist'] },
]

function SearchControls({ initialQuery = '', options = {} }: SearchControlsProps) {
  const [query, setQuery] = useState(initialQuery)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})

  function navigate(path: string) {
    window.history.pushState({}, '', path)
    window.dispatchEvent(new Event('locationchange'))
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    Object.entries(selectedFilters).forEach(([name, value]) => {
      if (value) params.set(name, value)
    })
    const queryString = params.toString()
    navigate(queryString ? `/search-results?${queryString}` : '/search-results')
  }

  function resetFilters() {
    setSelectedFilters({})
    navigate(query.trim() ? `/search-results?q=${encodeURIComponent(query.trim())}` : '/search-results')
  }

  return (
    <div className="search-area">
      <h1>Søg frivilligt arbejde:</h1>
      <form className="job-search" onSubmit={submitSearch}>
        <div className="search-input">
          <img src={searchIcon} alt="" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Eks. cafémedhjælper..."
          />
        </div>
        <button type="submit">Søg</button>
      </form>

      <div className="filters">
        <span className="filters-title">Filtrer:</span>
        {filters.map((filter) => (
          <label className="filter-control" key={filter.name}>
            <select
              value={selectedFilters[filter.name] ?? filter.options[0]}
              onChange={(event) => {
                setSelectedFilters((current) => ({
                  ...current,
                  [filter.name]: event.target.value === filter.options[0]
                    ? ''
                    : event.target.value,
                }))
              }}
            >
              {[...filter.options, ...(options[filter.name] ?? [])]
                .filter((option, index, values) => values.indexOf(option) === index)
                .map((option) => (
                  <option key={option}>{option}</option>
                ))}
            </select>
          </label>
        ))}
        <button className="filter-reset" type="button" onClick={resetFilters}>Nulstil</button>
      </div>
    </div>
  )
}

export default SearchControls
