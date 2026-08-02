import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function TextField({ label, error, id, ...props }: TextFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>
      <input
        id={fieldId}
        className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)]
          px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors
          focus:border-[var(--color-accent)]"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${fieldId}-error`} className="text-sm text-red-500">
          {error}
        </span>
      )}
    </div>
  )
}
