import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import RestaurantForm from '../components/RestaurantForm'
import { ErrorView, LoadingView } from '../components/StateViews'
import { useFetch } from '../hooks/useFetch'
import {
  createRestaurant,
  getErrorMessage,
  getRestaurant,
  getTowns,
  updateRestaurant,
} from '../api/restaurants'
import {
  FALLBACK_TOWNS,
  emptyFormValues,
  toFormValues,
  toPayload,
  type RestaurantFormValues,
} from '../schemas/restaurantSchema'

/** One page for both "apply a restaurant" (/restaurants/new) and "edit" (/restaurants/:id/edit). */
export default function RestaurantFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const existing = useFetch(() => (id ? getRestaurant(id) : Promise.resolve(null)), [id])
  const towns = useFetch(getTowns, [])

  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const townNames = towns.data && towns.data.length > 0 ? towns.data.map((t) => t.name) : FALLBACK_TOWNS
  if (existing.data?.town && !townNames.includes(existing.data.town)) townNames.push(existing.data.town)

  async function handleSubmit(values: RestaurantFormValues) {
    setSaving(true)
    setSubmitError(null)
    try {
      const payload = toPayload(values)
      if (isEdit && id) {
        await updateRestaurant(id, payload)
        navigate('/owner/dashboard', { state: { notice: 'Restaurant updated.' } })
      } else {
        await createRestaurant(payload)
        navigate('/owner/dashboard', {
          state: { notice: 'Restaurant submitted. It will appear once an admin approves it.' },
        })
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err, 'Could not save the restaurant. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && existing.loading) return <LoadingView label="Loading restaurant…" />
  if (isEdit && existing.error) return <ErrorView message={existing.error} onRetry={existing.reload} />

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 text-brown">
      <h1 className="mb-6 font-script text-4xl">{isEdit ? 'Edit restaurant' : 'Apply a restaurant'}</h1>
      <RestaurantForm
        defaultValues={existing.data ? toFormValues(existing.data) : emptyFormValues}
        towns={townNames}
        submitLabel={isEdit ? 'Save changes' : 'Submit for approval'}
        submitting={saving}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </main>
  )
}
