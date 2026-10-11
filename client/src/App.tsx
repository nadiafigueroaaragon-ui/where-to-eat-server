import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
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

export default function App() {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/towns" element={<Towns />} />
        <Route path="/towns/:id" element={<TownDetails />} />
        <Route path="/restaurants/new" element={<RestaurantFormPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetails />} />
        <Route path="/restaurants/:id/edit" element={<RestaurantFormPage />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/admin/restaurants" element={<ManageRestaurants />} />
        <Route path="/admin/approvals" element={<RestaurantApproval />} />
        <Route path="/admin/towns" element={<ManageTowns />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
