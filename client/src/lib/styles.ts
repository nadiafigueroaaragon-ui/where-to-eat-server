// Shared class strings for the design system. Palette comes from the @theme block in index.css.
export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'danger'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brown text-cream hover:bg-olive',
  secondary: 'border border-brown/60 text-brown hover:border-olive hover:bg-olive hover:text-cream',
  accent: 'bg-sun text-brown hover:brightness-95',
  danger: 'bg-brick text-cream hover:brightness-110',
}

export const buttonClass = (variant: ButtonVariant = 'primary', extra = '') =>
  `${base} ${variants[variant]} ${extra}`.trim()

export const inputClass =
  'w-full rounded-xl border border-brown/30 bg-cream px-4 py-2 text-sm text-brown placeholder:text-brown/40 focus:border-olive focus:outline-none'
