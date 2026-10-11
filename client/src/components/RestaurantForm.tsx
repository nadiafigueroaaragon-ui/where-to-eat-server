import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CUISINES,
  DAYS,
  DINING_TYPES,
  PRICE_LEVELS,
  restaurantSchema,
  type RestaurantFormValues,
} from '../schemas/restaurantSchema'

type Props = {
  defaultValues: RestaurantFormValues
  towns: string[]
  submitLabel: string
  submitting: boolean
  submitError: string | null
  onSubmit: (values: RestaurantFormValues) => void
  onCancel: () => void
}

const inputClass =
  'w-full rounded-lg border border-brown/30 bg-white px-3 py-2 text-sm text-brown focus:outline-2 focus:outline-sun'

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
      {error && (
        <span role="alert" className="mt-1 block text-xs text-brick">
          {error}
        </span>
      )}
    </label>
  )
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function RestaurantForm({
  defaultValues,
  towns,
  submitLabel,
  submitting,
  submitError,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues,
  })

  const hours = watch('hours')

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 text-brown">
      <section className="space-y-4">
        <h2 className="font-script text-2xl">Basics</h2>
        <Field label="Restaurant name" error={errors.name?.message}>
          <input className={inputClass} {...register('name')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Town" error={errors.town?.message}>
            <select className={inputClass} {...register('town')}>
              <option value="">Choose a town</option>
              {towns.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Area (optional, e.g. Clark, Balibago)" error={errors.area?.message}>
            <input className={inputClass} {...register('area')} />
          </Field>
        </div>
        <Field label="Address" error={errors.address?.message}>
          <input className={inputClass} {...register('address')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude (e.g. 15.03)" error={errors.latitude?.message}>
            <input
              type="number"
              step="any"
              className={inputClass}
              {...register('latitude', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Longitude (e.g. 120.69)" error={errors.longitude?.message}>
            <input
              type="number"
              step="any"
              className={inputClass}
              {...register('longitude', { valueAsNumber: true })}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-script text-2xl">Details</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Cuisine" error={errors.cuisine?.message}>
            <select className={inputClass} {...register('cuisine')}>
              <option value="">Choose</option>
              {CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Dining type" error={errors.diningType?.message}>
            <select className={inputClass} {...register('diningType')}>
              <option value="">Choose</option>
              {DINING_TYPES.map((d) => (
                <option key={d} value={d}>
                  {cap(d)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price level" error={errors.priceLevel?.message}>
            <select className={inputClass} {...register('priceLevel')}>
              <option value="">Choose</option>
              {PRICE_LEVELS.map((p) => (
                <option key={p} value={p}>
                  {cap(p)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Average meal cost (₱)" error={errors.averageMealCost?.message}>
            <input
              type="number"
              min={0}
              className={inputClass}
              {...register('averageMealCost', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Seats per time slot" error={errors.seatsPerSlot?.message}>
            <input
              type="number"
              min={1}
              className={inputClass}
              {...register('seatsPerSlot', { valueAsNumber: true })}
            />
          </Field>
        </div>
        <Field label="Description" error={errors.description?.message}>
          <textarea rows={3} className={inputClass} {...register('description')} />
        </Field>
        <Field label="Photo links (one per line, first is the main photo)" error={errors.images?.message}>
          <textarea
            rows={3}
            placeholder="https://example.com/photo1.jpg"
            className={inputClass}
            {...register('images')}
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="font-script text-2xl">Opening hours</h2>
        <p className="text-xs text-brown/70">
          A closing time earlier than the opening time means the restaurant closes after midnight.
        </p>
        <ul className="space-y-2">
          {DAYS.map((day) => {
            const closed = hours?.[day]?.closed
            const dayErrors = errors.hours?.[day]
            return (
              <li key={day} className="grid grid-cols-[6rem_1fr] items-start gap-3 text-sm sm:grid-cols-[7rem_auto_1fr]">
                <span className="pt-2 font-medium">{cap(day)}</span>
                <label className="flex items-center gap-2 pt-2 text-xs">
                  <input type="checkbox" {...register(`hours.${day}.closed`)} />
                  Closed
                </label>
                {!closed && (
                  <div className="col-span-2 flex flex-wrap items-start gap-2 sm:col-span-1">
                    <div>
                      <input
                        type="time"
                        aria-label={`${cap(day)} opening time`}
                        className={inputClass}
                        {...register(`hours.${day}.open`)}
                      />
                      {dayErrors?.open?.message && (
                        <span role="alert" className="block text-xs text-brick">
                          {dayErrors.open.message}
                        </span>
                      )}
                    </div>
                    <span className="pt-2">to</span>
                    <div>
                      <input
                        type="time"
                        aria-label={`${cap(day)} closing time`}
                        className={inputClass}
                        {...register(`hours.${day}.close`)}
                      />
                      {dayErrors?.close?.message && (
                        <span role="alert" className="block text-xs text-brick">
                          {dayErrors.close.message}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {submitError && (
        <p role="alert" className="rounded-lg bg-brick/10 px-4 py-2 text-sm text-brick">
          {submitError}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brown px-6 py-2 text-sm text-cream disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-full border border-brown/30 px-6 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
