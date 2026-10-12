import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

type NavItem = { to: string; label: string }

// Set to true once there is a /reviews page, so the link stops leading to "Page not found"
const SHOW_REVIEWS = true

const reviewsLink: NavItem[] = SHOW_REVIEWS ? [{ to: '/reviews', label: 'Reviews' }] : []

// Guest
const guestLinks: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/towns', label: 'Towns' },
  ...reviewsLink,
]

// Traveler: their own bookings and reviews
const travelerLinks: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/reservations', label: 'Reservations' },
  ...reviewsLink,
  { to: '/towns', label: 'Towns' },
]

// Owner: bookings and reviews made at their restaurants
const ownerLinks: NavItem[] = [
  { to: '/owner/dashboard', label: 'Restaurant' },
  { to: '/restaurants/new', label: 'Apply' },
  { to: '/owner/reservations', label: 'Reservations' },
  { to: '/owner/reviews', label: 'Reviews' },
]

// Admin while browsing the public site. Admin pages use the sidebar (AdminLayout) instead.
const adminSiteLinks: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/towns', label: 'Towns' },
  ...reviewsLink,
  { to: '/admin/approvals', label: 'Manage' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap text-sm uppercase tracking-wide text-cream transition hover:text-sun ${
    isActive ? 'underline underline-offset-4' : ''
  }`

const pillClass =
  'whitespace-nowrap rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase text-brown transition hover:brightness-95'

export default function Navbar() {
  const [open, setOpen] = useState(false) // mobile menu
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  // Derived while rendering, not stored in state
  const links: NavItem[] = !user
    ? guestLinks
    : user.role === 'admin'
      ? adminSiteLinks
      : user.role === 'owner'
        ? ownerLinks
        : travelerLinks
  const firstName = user?.name.split(' ')[0]

  return (
    <header className="sticky top-0 z-50 bg-brown">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-8">
        {/* Logo and links for the current role */}
        <div className="flex items-center gap-8">
          <Link to="/" className="whitespace-nowrap font-script text-3xl text-cream">
            Where to eat?
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Account area (desktop) */}
        <div className="hidden items-center gap-5 lg:flex">
          {user ? (
            <>
              <span className="whitespace-nowrap text-sm text-cream/80">{firstName}</span>
              <button type="button" onClick={handleLogout} className={pillClass}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <Link to="/register" className={pillClass}>
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Menu button (mobile and tablet) */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-md px-2 py-1 text-2xl text-cream lg:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col gap-4 border-t border-cream/20 px-4 py-4 lg:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}

          <div className="flex flex-col gap-3 border-t border-cream/20 pt-4">
            {user ? (
              <>
                <span className="text-sm text-cream/80">Hi, {firstName}</span>
                <button type="button" onClick={handleLogout} className={`w-fit ${pillClass}`}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                  Login
                </NavLink>
                <Link to="/register" onClick={() => setOpen(false)} className={`w-fit ${pillClass}`}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}