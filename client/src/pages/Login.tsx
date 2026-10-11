import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../lib/apiError'
import { loginSchema, type LoginValues } from '../lib/authSchemas'
import { buttonClass, inputClass } from '../lib/formStyles'

export default function Login() {
  const { user, loading, login } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  // Already logged in: go to the page they came from
  if (!loading && user) return <Navigate to={from} replace />

  const onSubmit = async (values: LoginValues) => {
    setServerError('')
    try {
      await login(values.email, values.password)
    } catch (err) {
      setServerError(getErrorMessage(err))
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-center font-script text-5xl text-brown">Welcome back</h1>
      <p className="mt-2 text-center text-brown/70">Log in to book tables and write reviews.</p>

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

        <FormField label="Email" error={errors.email?.message}>
          <input type="email" autoComplete="email" className={inputClass} {...register('email')} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <input
            type="password"
            autoComplete="current-password"
            className={inputClass}
            {...register('password')}
          />
        </FormField>

        <button type="submit" disabled={isSubmitting} className={buttonClass}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-center text-sm text-brown/70">
          No account yet?{' '}
          <Link to="/register" className="font-semibold text-brown underline">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  )
}
