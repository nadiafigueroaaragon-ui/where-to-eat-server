import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { buttonClass, type ButtonVariant } from '../../lib/styles'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }

export default function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return <button type="button" className={buttonClass(variant, className)} {...rest} />
}

export function ButtonLink({ variant = 'primary', className = '', ...rest }: LinkProps & { variant?: ButtonVariant }) {
  return <Link className={buttonClass(variant, className)} {...rest} />
}
