import { Link } from 'react-router-dom'

export default function OwnerCta() {
  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-8">
      <div className="rounded-3xl bg-brown px-6 py-10 sm:px-10 sm:py-12">
        <p className="font-script text-3xl text-sun sm:text-4xl">Own a restaurant?</p>
        <h2 className="mt-2 max-w-xl text-2xl font-semibold text-cream sm:text-3xl">
          Get found by hungry people nearby
        </h2>
        <Link
          to="/restaurants/new"
          className="mt-6 inline-block rounded-full bg-sun px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-brown transition-colors hover:bg-olive hover:text-cream"
        >
          List your restaurant
        </Link>
      </div>
    </section>
  )
}