import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

// The gloss overlay (a soft white highlight fading toward the bottom) works
// over any solid base color, so primary/danger get a bit of depth without
// needing a per-color gradient computed from the accent's hue.
const GLOSS = '[background-image:linear-gradient(to_bottom,rgba(255,255,255,0.18),rgba(255,255,255,0))]'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: `bg-[var(--naipe-accent,var(--color-accent))] ${GLOSS} text-[var(--color-accent-contrast,white)] shadow-[var(--shadow-card)] hover:opacity-90`,
  secondary: 'bg-[var(--color-surface-raised)] text-[var(--color-text)] hover:bg-[var(--color-surface-sunken)]',
  ghost: 'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-raised)]',
  danger: `bg-[var(--color-naipe-soprano)] ${GLOSS} text-white shadow-[var(--shadow-card)] hover:opacity-90`,
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
