import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-brown">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-olive underline">Back to home</Link>
    </div>
  )
}