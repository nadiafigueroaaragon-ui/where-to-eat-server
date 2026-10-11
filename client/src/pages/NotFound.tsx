import { ButtonLink } from '../components/ui/Button'

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="font-script text-7xl text-brown">404</p>
      <h1 className="mt-2 text-xl font-semibold text-brown">This table does not exist</h1>
      <p className="mt-2 text-sm text-brown/70">The page you are looking for was moved or never existed.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <ButtonLink to="/">Back to home</ButtonLink>
        <ButtonLink to="/towns" variant="secondary">Browse towns</ButtonLink>
      </div>
    </main>
  )
}
