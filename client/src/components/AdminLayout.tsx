import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const adminLinks = [
  { to: '/admin/restaurants', label: 'Manage Restaurants' },
  { to: '/admin/approvals', label: 'Approvals' },
  { to: '/admin/towns', label: 'Manage Towns' },
  { to: '/admin/reviews', label: 'Review Moderation' },
]

const sideLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block whitespace-nowrap rounded-lg px-3 py-2 text-sm transition hover:bg-cream/10 hover:text-sun ${
    isActive ? 'bg-cream/10 text-sun' : 'text-cream'
  }`

const pillClass =
  'whitespace-nowrap rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase text-brown transition hover:brightness-95'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans md:flex-row">
      <aside className="flex w-full flex-col gap-6 bg-brown px-5 py-6 md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0">
        <div>
          <Link to="/" className="block whitespace-nowrap font-script text-3xl text-cream">
            Where to eat?
          </Link>
          <p className="mt-1 text-sm uppercase tracking-wide text-cream">Admin</p>
        </div>

        <nav aria-label="Admin" className="flex flex-row flex-wrap gap-1 md:mt-8 md:flex-col">
          {adminLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={sideLinkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:mt-auto">
          <Link to="/" className="text-sm text-cream/80 transition hover:text-sun">
            View site
          </Link>
          <button type="button" onClick={handleLogout} className={pillClass}>
            Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  )
}