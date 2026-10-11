import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { CHIPS, emptyFilters, type Filters } from '../lib/filters'

type Props = {
  filters: Filters
  onChange: (filters: Filters) => void
}

const chipClass = (active: boolean) =>
  `inline-flex cursor-pointer items-center gap-1 rounded-full border px-4 py-1.5 text-xs transition-colors hover:border-olive hover:bg-olive hover:text-cream ${
    active ? 'border-olive bg-olive text-cream' : 'border-brown/60 text-brown'
  }`

export default function FilterChips({ filters, onChange }: Props) {
  const [openKey, setOpenKey] = useState<keyof Filters | null>(null)

  // Derived while rendering, not stored in state
  const hasFilters = Object.values(filters).some(Boolean)
  const openChip = CHIPS.find((c) => c.key === openKey)

  return (
    <section className="px-4 sm:px-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase text-brown">Filters:</span>

        {CHIPS.map((chip) => {
          const selected = chip.options.find((o) => o.value === filters[chip.key])
          return (
            <button
              key={chip.key}
              type="button"
              aria-expanded={openKey === chip.key}
              onClick={() => setOpenKey(openKey === chip.key ? null : chip.key)}
              className={chipClass(Boolean(selected))}
            >
              {selected ? selected.label : chip.label}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )
        })}

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              onChange(emptyFilters)
              setOpenKey(null)
            }}
            className="text-xs text-brick underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Options for the open pill, shown below the row so nothing overflows on phones */}
      {openChip && (
        <div className="mx-auto mt-3 flex max-w-2xl flex-wrap justify-center gap-2 rounded-2xl bg-brown/5 p-3">
          {[{ value: '', label: 'Any' }, ...openChip.options].map((option) => (
            <button
              key={option.value || 'any'}
              type="button"
              onClick={() => {
                onChange({ ...filters, [openChip.key]: option.value })
                setOpenKey(null)
              }}
              className={chipClass(option.value !== '' && filters[openChip.key] === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}