import { useState } from 'react'
import Hero from '../components/Hero'
import FilterChips from '../components/FilterChips'
import { emptyFilters, type Filters } from '../lib/filters'

export default function Home() {
  const [filters, setFilters] = useState<Filters>(emptyFilters)

  return (
    <main>
      <Hero />
      <FilterChips filters={filters} onChange={setFilters} />
    </main>
  )
}