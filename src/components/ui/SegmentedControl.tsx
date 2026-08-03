import clsx from 'clsx'

interface SegmentedControlOption<T extends string> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/**
 * A neutral, iOS-style segmented control: a sunken rounded-full track with
 * the active segment shown as a raised rounded-full pill (subtle gradient +
 * shadow for depth). Deliberately monochrome — used for navigational
 * switches (naipe filter, file-type filter, admin section nav), where the
 * per-naipe color accent belongs in the content below, not on the switch
 * itself (see CLAUDE.md "Direção de design").
 */
export function SegmentedControl<T extends string>({ options, value, onChange, className }: SegmentedControlProps<T>) {
  return (
    <div className={clsx('inline-flex w-full gap-0.5 overflow-x-auto rounded-full bg-[var(--color-surface-sunken)] p-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150',
            value === opt.value
              ? 'bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-raised)] text-[var(--color-text)] shadow-[var(--shadow-card)]'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
