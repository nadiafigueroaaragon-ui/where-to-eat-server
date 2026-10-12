import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from './ui/Button'
import FormField from './ui/FormField'
import StarInput from './ui/StarInput'
import { inputClass } from '../lib/styles'
import { todayManila } from '../lib/dates'
import { reviewSchema, type ReviewFormValues } from '../lib/reviewSchema'

type Props = {
  initialValues?: ReviewFormValues
  submitLabel: string
  onSubmit: (values: ReviewFormValues) => Promise<void>
  onCancel: () => void
}

const empty: ReviewFormValues = { rating: 0, comment: '', visitDate: '' }

// One form for both writing and editing a review
export default function ReviewForm({ initialValues, submitLabel, onSubmit, onCancel }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({ resolver: zodResolver(reviewSchema), defaultValues: initialValues ?? empty })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FormField label="Your rating" htmlFor="rating" error={errors.rating?.message}>
        <Controller control={control} name="rating" render={({ field }) => <StarInput id="rating" value={field.value} onChange={field.onChange} />} />
      </FormField>

      <FormField label="Date you visited" htmlFor="visitDate" error={errors.visitDate?.message}>
        <input id="visitDate" type="date" max={todayManila()} className={inputClass} {...register('visitDate')} />
      </FormField>

      <FormField label="Your review" htmlFor="comment" error={errors.comment?.message} hint="At least 10 characters. What did you eat? How was the service?">
        <textarea id="comment" rows={5} placeholder="Tell other travelers about your visit" className={inputClass} {...register('comment')} />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
