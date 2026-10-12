import { Link } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/towns', label: 'Towns' },
  { to: '/restaurants/new', label: 'List your restaurant' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Sign up' },
]

export default function Footer() {
  return (
    <footer className="mt-auto bg-brown text-cream">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between sm:px-8">
        <div className="max-w-xs">
          <p className="font-script text-4xl">Where to eat?</p>
          <p className="mt-2 text-sm text-cream/70">
            Find, compare, and book tables at restaurants across Pampanga.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-cream/80 transition-colors hover:text-sun">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-cream/20 px-4 py-4 text-center text-xs text-cream/60">
        © 2026 Where to eat? · CTADWEBL final project
      </div>
    </footer>
  )
}