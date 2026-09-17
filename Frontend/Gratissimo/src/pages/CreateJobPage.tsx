import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../hooks/useAuth'

type Option = {
  id: number
  name?: string
  type?: string
}

type Form = {
  title: string
  organization: string
  description: string
  address: string
  zipcode: string
  city: string
  regionId: string
  jobCategoryId: string
  workTypeId: string
}

const apiUrl = import.meta.env.VITE_API_URL
const emptyForm: Form = {
  title: '',
  organization: '',
  description: '',
  address: '',
  zipcode: '',
  city: '',
  regionId: '',
  jobCategoryId: '',
  workTypeId: '',
}

type TextFieldProps = {
  label: string
  value: string
  placeholder: string
  error?: string
  inputMode?: 'numeric'
  onChange: (value: string) => void
}

function TextField({ label, value, placeholder, error, inputMode, onChange }: TextFieldProps) {
  return (
    <label>
      {label}
      <input
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <small>{error}</small>}
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  placeholder: string
  options: Option[]
  error?: string
  onChange: (value: string) => void
}

function SelectField({ label, value, placeholder, options, error, onChange }: SelectFieldProps) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option value={option.id} key={option.id}>{option.name ?? option.type}</option>
        ))}
      </select>
      {error && <small>{error}</small>}
    </label>
  )
}

function CreateJobPage() {
  const { isAuthenticated, user, accessToken } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [regions, setRegions] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [workTypes, setWorkTypes] = useState<Option[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return

    Promise.all([
      fetch(`${apiUrl}/api/regions`),
      fetch(`${apiUrl}/api/job-categories`),
      fetch(`${apiUrl}/api/workTypes`),
    ])
      .then(async ([regionsResponse, categoriesResponse, workTypesResponse]) => {
        if (regionsResponse.ok) setRegions(await regionsResponse.json())
        if (categoriesResponse.ok) setCategories(await categoriesResponse.json())
        if (workTypesResponse.ok) setWorkTypes(await workTypesResponse.json())
      })
      .catch(() => setErrors({ form: 'Kunne ikke hente formularens valgmuligheder.' }))
  }, [isAuthenticated])

  function updateField(field: keyof Form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setMessage('')
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    const requiredFields: Array<[keyof Form, string]> = [
      ['title', 'Overskrift er påkrævet.'],
      ['organization', 'Organisation / Forening er påkrævet.'],
      ['description', 'Job beskrivelse er påkrævet.'],
      ['address', 'Adresse er påkrævet.'],
      ['zipcode', 'Postnummer er påkrævet.'],
      ['city', 'By er påkrævet.'],
      ['regionId', 'Lokation er påkrævet.'],
      ['jobCategoryId', 'Kategori er påkrævet.'],
      ['workTypeId', 'Arbejdstid er påkrævet.'],
    ]

    requiredFields.forEach(([field, message]) => {
      if (!form[field].trim()) nextErrors[field] = message
    })

    if (form.zipcode && !/^\d{4}$/.test(form.zipcode)) {
      nextErrors.zipcode = 'Postnummer skal være 4 cifre.'
    }

    return nextErrors
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    setMessage('')
    if (Object.keys(nextErrors).length) return

    try {
      const response = await fetch(`${apiUrl}/api/job-listings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          title: form.title,
          description: form.description,
          address: form.address,
          zipcode: form.zipcode,
          city: form.city,
          workHome: 'On-site',
          regionId: form.regionId,
          userId: String(user?.id),
          jobCategoryId: form.jobCategoryId,
          organization: form.organization,
          workTypeId: form.workTypeId,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setErrors({ form: data.error ?? 'Annoncen kunne ikke oprettes.' })
        return
      }

      setForm(emptyForm)
      setMessage('Din annonce er blevet oprettet.')
    } catch {
      setErrors({ form: 'Der kunne ikke oprettes forbindelse til serveren.' })
    }
  }

  if (!isAuthenticated) {
    return (
      <section className="create-job-page create-job-message">
        <h1>Opret en annonce</h1>
        <p>Du skal logge ind, før du kan oprette en annonce.</p>
        <a href="/login">Log ind</a>
      </section>
    )
  }

  return (
    <section className="create-job-page">
      <div className="home-intro">
        <p>Vi hjælper dig på vej til dit næste frivillige job</p>
        <a href="/min-side">Log ind eller opret dig</a>
      </div>

      <header className="create-job-intro">
        <h1>Opret en annonce og find frivillige til din forening</h1>
        <p>
          Gratissimo er gratis for alle. Frivillige, organisationer og foreninger.
          Du skaber det frivillige liv og vi formidler kontakten. Når du har
          fundet en frivillig til din forening, kan du blot fjerne annoncen igen
          ved at gå til din side.
        </p>
        <a href="/min-side">Gå til min side</a>
      </header>

      <form className="create-job-form" onSubmit={submit}>
        <div className="create-job-fields">
          <TextField
            label="Overskrift"
            placeholder="Eks. medhjælper søges..."
            value={form.title}
            error={errors.title}
            onChange={(value) => updateField('title', value)}
          />
          <TextField
            label="Organisation / Forening"
            placeholder="Skriv din forening her..."
            value={form.organization}
            error={errors.organization}
            onChange={(value) => updateField('organization', value)}
          />
          <SelectField
            label="Lokation"
            placeholder="Vælg lokation..."
            value={form.regionId}
            options={regions}
            error={errors.regionId}
            onChange={(value) => updateField('regionId', value)}
          />
          <SelectField
            label="Kategori"
            placeholder="Vælg kategori..."
            value={form.jobCategoryId}
            options={categories}
            error={errors.jobCategoryId}
            onChange={(value) => updateField('jobCategoryId', value)}
          />
          <SelectField
            label="Arbejdstid"
            placeholder="Vælg arbejdstid..."
            value={form.workTypeId}
            options={workTypes}
            error={errors.workTypeId}
            onChange={(value) => updateField('workTypeId', value)}
          />
          <TextField
            label="Adresse"
            placeholder="Eks. Holmegaade 22, 1. sal"
            value={form.address}
            error={errors.address}
            onChange={(value) => updateField('address', value)}
          />
          <TextField
            label="Postnummer"
            placeholder="Eks. 9200"
            value={form.zipcode}
            error={errors.zipcode}
            inputMode="numeric"
            onChange={(value) => updateField('zipcode', value)}
          />
          <TextField
            label="By"
            placeholder="Eks. Aalborg SV"
            value={form.city}
            error={errors.city}
            onChange={(value) => updateField('city', value)}
          />
        </div>
        <label className="create-job-description">
          Job beskrivelse
          <textarea
            placeholder="Her kan du beskrive jobbet, hvilke erfaringer der kræves og hvad der forventes af den frivillige..."
            value={form.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
          {errors.description && <small>{errors.description}</small>}
        </label>
        {errors.form && <p className="create-job-error">{errors.form}</p>}
        {message && <p className="create-job-success">{message}</p>}
        <button type="submit">Opret annonce</button>
      </form>
    </section>
  )
}

export default CreateJobPage
