import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Towns from './pages/Towns'
import TownDetails from './pages/TownDetails'
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
        <Route path="/admin/towns" element={<ManageTowns />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}