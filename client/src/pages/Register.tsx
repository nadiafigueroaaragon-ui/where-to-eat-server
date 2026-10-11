import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../lib/apiError'
import { registerSchema, type RegisterValues } from '../lib/authSchemas'
import { buttonClass, inputClass } from '../lib/formStyles'

export default function Register() {
  const { user, loading, register: signUp } = useAuth()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'traveler' },
  })

  // Account created (or already logged in): go home
  if (!loading && user) return <Navigate to="/" replace />

  const onSubmit = async ({ name, email, password, role }: RegisterValues) => {
    setServerError('')
    try {
      await signUp({ name, email, password, role })
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center font-script text-5xl text-brown">Join Where to eat?</h1>
      <p className="mt-2 text-center text-brown/70">Create an account to start exploring Pampanga.</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mt-8 space-y-4 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
      >
        {serverError && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
            {serverError}
          </p>
        )}

        <FormField label="Name" error={errors.name?.message}>
          <input type="text" autoComplete="name" className={inputClass} {...register('name')} />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" className={inputClass} {...register('email')} />
        </FormField>

        <FormField label="I am a..." error={errors.role?.message}>
          <select className={inputClass} {...register('role')}>
            <option value="traveler">Traveler (looking for places to eat)</option>
            <option value="owner">Restaurant owner</option>
          </select>
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            {...register('password')}
          />
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword?.message}>
          <input
            type="password"
            autoComplete="new-password"
            className={inputClass}
            {...register('confirmPassword')}
          />
        </FormField>

        <button type="submit" disabled={isSubmitting} className={buttonClass}>
          {isSubmitting ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="text-center text-sm text-brown/70">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brown underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  )
}
