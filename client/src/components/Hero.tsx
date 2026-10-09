import { Search } from 'lucide-react'

export default function Hero() {
  return (
    <section className="px-4 pb-6 pt-12 text-center sm:px-8 sm:pt-16">
      <h1 className="font-script text-5xl leading-tight text-brown sm:text-6xl">
        Where will your taste buds get ya&apos;?
      </h1>

      <div className="mx-auto mt-8 flex max-w-md items-center gap-3 rounded-full border border-brown/60 bg-cream px-5 py-3">
        <Search className="h-5 w-5 shrink-0 text-brown" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-transparent text-sm text-brown placeholder:text-brown/50 focus:outline-none"
        />
      </div>
    </section>
  )
}