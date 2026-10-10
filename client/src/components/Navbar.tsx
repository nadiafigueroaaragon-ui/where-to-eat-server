import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const leftLinks = [
  { to: '/', label: 'Home' },
  { to: '/towns', label: 'Towns' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm uppercase tracking-wide text-cream transition hover:text-sun ${
    isActive ? 'underline underline-offset-4' : ''
  }`

const pillClass =
  'rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase text-brown transition hover:brightness-95'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Links change by role
  const rightLinks = [
    { to: '/reviews', label: 'Reviews' },
    ...(user?.role === 'admin' ? [{ to: '/admin/towns', label: 'Manage towns' }] : []),
    ...(user ? [] : [{ to: '/login', label: 'Login' }]),
  ]

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  const firstName = user?.name.split(' ')[0]

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
          {user ? (
            <>
              <span className="text-sm text-cream/80">Hi, {firstName}</span>
              <button type="button" onClick={handleLogout} className={pillClass}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/register" className={pillClass}>
              Sign up
            </Link>
          )}
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
          {user ? (
            <>
              <span className="text-sm text-cream/80">Hi, {firstName}</span>
              <button type="button" onClick={handleLogout} className={`w-fit ${pillClass}`}>
                Log out
              </button>
            </>
          ) : (
            <Link to="/register" onClick={() => setOpen(false)} className={`w-fit ${pillClass}`}>
              Sign up
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
