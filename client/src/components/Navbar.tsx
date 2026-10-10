import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
const leftLinks = [
  { to: '/', label: 'Home' },
  { to: '/towns', label: 'Towns' },
]
const rightLinks = [
  { to: '/reviews', label: 'Reviews' },
  { to: '/login', label: 'Login' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm uppercase tracking-wide text-cream transition hover:text-sun ${
    isActive ? 'underline underline-offset-4' : ''
  }`

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-brown">
      <nav className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 py-3 sm:px-8">
        {/* Left links (desktop) */}
        <div className="hidden gap-8 md:flex">
          {leftLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Logo: left on mobile, centered on desktop */}
        <Link to="/" className="col-start-1 font-script text-3xl text-cream md:col-start-2">
          Where to eat?
        </Link>

        {/* Right links (desktop) */}
        <div className="hidden items-center justify-end gap-8 md:flex">
          {rightLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/register"
            className="rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase text-brown transition hover:brightness-95"
          >
            Sign up
          </Link>
        </div>

        {/* Menu button (mobile) */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          className="col-start-3 justify-self-end rounded-md px-2 py-1 text-2xl text-cream md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col gap-4 border-t border-cream/20 px-4 py-4 md:hidden">
          {[...leftLinks, ...rightLinks].map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/register"
            onClick={() => setOpen(false)}
            className="w-fit rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase text-brown"
          >
            Sign up
          </Link>
        </div>
      )}
    </header>
  )
}