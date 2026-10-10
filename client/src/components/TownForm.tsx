import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { townSchema, type TownFormValues } from '../lib/townSchema'

type Props = {
  initialValues?: TownFormValues
  submitLabel: string
  onSubmit: (values: TownFormValues) => Promise<void>
  onCancel: () => void
}

const inputClass =
  'w-full rounded-xl border border-brown/30 bg-cream px-4 py-2 text-sm text-brown placeholder:text-brown/40 focus:border-olive focus:outline-none'

export default function TownForm({ initialValues, submitLabel, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TownFormValues>({
    resolver: zodResolver(townSchema),
    defaultValues: initialValues ?? { name: '', description: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase text-brown">
          Town name
        </label>
        <input id="name" type="text" placeholder="e.g. Lubao" className={inputClass} {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-brick">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-xs font-semibold uppercase text-brown">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="A short description of the town"
          className={inputClass}
          {...register('description')}
        />
        {errors.description && <p className="mt-1 text-xs text-brick">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-brown/60 px-5 py-2 text-xs text-brown transition-colors hover:border-olive hover:bg-olive hover:text-cream"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-brown px-5 py-2 text-xs text-cream transition-colors hover:bg-olive disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}