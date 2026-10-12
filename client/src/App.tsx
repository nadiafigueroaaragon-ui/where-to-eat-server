import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthProvider'
import Home from './pages/Home'
import Towns from './pages/Towns'
import TownDetails from './pages/TownDetails'
import RestaurantDetails from './pages/RestaurantDetails'
import OwnerDashboard from './pages/OwnerDashboard'
import RestaurantFormPage from './pages/RestaurantFormPage'
import ManageRestaurants from './pages/ManageRestaurants'
import RestaurantApproval from './pages/RestaurantApproval'
import NotFound from './pages/NotFound'
import ManageTowns from './pages/ManageTowns'
import WriteReview from './pages/WriteReview'
import MyReviews from './pages/MyReviews'
import ReviewModeration from './pages/ReviewModeration'
import Login from './pages/Login'
import Register from './pages/Register'

// Top navbar and footer for every page except the admin pages
function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<SiteLayout />}>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/towns" element={<Towns />} />
          <Route path="/towns/:id" element={<TownDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Owner or admin: create and edit restaurants, owner dashboard.
              /restaurants/new must stay above /restaurants/:id */}
          <Route element={<ProtectedRoute roles={['owner', 'admin']} />}>
            <Route path="/restaurants/new" element={<RestaurantFormPage />} />
            <Route path="/restaurants/:id/edit" element={<RestaurantFormPage />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>

          <Route path="/restaurants/:id" element={<RestaurantDetails />} />

          {/* Reviews */}
          <Route path="/restaurants/:id/review" element={<WriteReview mode="create" />} />
          <Route path="/reviews" element={<MyReviews />} />
          <Route path="/reviews/:id/edit" element={<WriteReview mode="edit" />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin only: sidebar layout, no top navbar or footer */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/restaurants" element={<ManageRestaurants />} />
            <Route path="/admin/approvals" element={<RestaurantApproval />} />
            <Route path="/admin/towns" element={<ManageTowns />} />
            <Route path="/admin/reviews" element={<ReviewModeration />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}