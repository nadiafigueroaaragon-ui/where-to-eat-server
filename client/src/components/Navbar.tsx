import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

// Set to true once there is a /reviews page, so the link stops leading to "Page not found"
const SHOW_REVIEWS = true

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/towns', label: 'Towns' },
  ...(SHOW_REVIEWS ? [{ to: '/reviews', label: 'Reviews' }] : []),
]

const adminLinks = [
  { to: '/admin/approvals', label: 'Approvals' },
  { to: '/admin/restaurants', label: 'Restaurants' },
  { to: '/admin/towns', label: 'Manage towns' },
  { to: '/admin/reviews', label: 'Reviews' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap text-sm uppercase tracking-wide text-cream transition hover:text-sun ${
    isActive ? 'underline underline-offset-4' : ''
  }`

const pillClass =
  'whitespace-nowrap rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase text-brown transition hover:brightness-95'

export default function Navbar() {
  const [open, setOpen] = useState(false) // mobile menu
  const [adminOpen, setAdminOpen] = useState(false) // desktop admin dropdown
  const adminRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Close the dropdown when clicking elsewhere or pressing Escape
  useEffect(() => {
    if (!adminOpen) return
    const onClick = (e: MouseEvent) => {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) setAdminOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAdminOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [adminOpen])

  const handleLogout = () => {
    logout()
    setOpen(false)
    setAdminOpen(false)
    navigate('/')
  }

  // Derived while rendering, not stored in state
  const isAdmin = user?.role === 'admin'
  const isOwner = user?.role === 'owner'
  const onAdminPage = pathname.startsWith('/admin')
  const firstName = user?.name.split(' ')[0]

  return (
    <header className="sticky top-0 z-50 bg-brown">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-8">
        {/* Logo and public links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="whitespace-nowrap font-script text-3xl text-cream">
            Where to eat?
          </Link>
          <div className="hidden items-center gap-6 lg:flex">
            {publicLinks.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Account area (desktop) */}
        <div className="hidden items-center gap-5 lg:flex">
          {isAdmin && (
            <div ref={adminRef} className="relative">
              <button
                type="button"
                onClick={() => setAdminOpen((o) => !o)}
                aria-expanded={adminOpen}
                aria-haspopup="menu"
                className={`flex items-center gap-1 whitespace-nowrap text-sm uppercase tracking-wide text-cream transition hover:text-sun ${
                  onAdminPage ? 'underline underline-offset-4' : ''
                }`}
              >
                Manage
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {adminOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-cream/20 bg-brown py-2 shadow-lg"
                >
                  {adminLinks.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      role="menuitem"
                      onClick={() => setAdminOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm uppercase tracking-wide transition hover:bg-cream/10 hover:text-sun ${
                          isActive ? 'text-sun' : 'text-cream'
                        }`
                      }
                    >
                      {l.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

          {isOwner && (
            <NavLink to="/owner/dashboard" className={linkClass}>
              My restaurants
            </NavLink>
          )}

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
          {publicLinks.map((l) => (
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

          {isAdmin && (
            <div className="flex flex-col gap-3 border-t border-cream/20 pt-4">
              <span className="text-xs uppercase tracking-wide text-cream/60">Manage</span>
              {adminLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
            </div>
          )}

          {isOwner && (
            <NavLink to="/owner/dashboard" className={linkClass} onClick={() => setOpen(false)}>
              My restaurants
            </NavLink>
          )}

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