import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Towns from './pages/Towns'
import TownDetails from './pages/TownDetails'
import NotFound from './pages/NotFound'
import ManageTowns from './pages/ManageTowns'
import RestaurantDetails from './pages/RestaurantDetails'
import WriteReview from './pages/WriteReview'
import MyReviews from './pages/MyReviews'
import ReviewModeration from './pages/ReviewModeration'

export default function App() {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/towns" element={<Towns />} />
        <Route path="/towns/:id" element={<TownDetails />} />
        <Route path="/admin/towns" element={<ManageTowns />} />
        <Route path="/restaurants/:id" element={<RestaurantDetails />} />
        <Route path="/restaurants/:id/review" element={<WriteReview mode="create" />} />
        <Route path="/reviews" element={<MyReviews />} />
        <Route path="/reviews/:id/edit" element={<WriteReview mode="edit" />} />
        <Route path="/admin/reviews" element={<ReviewModeration />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}