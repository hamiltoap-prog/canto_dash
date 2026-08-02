import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-[var(--naipe-accent,var(--color-accent))] text-white hover:opacity-90',
  secondary: 'bg-[var(--color-surface-raised)] text-[var(--color-text)] hover:bg-[var(--color-surface-sunken)]',
  ghost: 'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

export function Button({ variant = 'primary', className, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        className,
      )}
      disabled={disabled}
      {...props}
    />
  )
}
