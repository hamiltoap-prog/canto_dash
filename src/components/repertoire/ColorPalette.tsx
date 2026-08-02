import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function ColorPalette({ colors }: { colors: string[] }) {
  const [copied, setCopied] = useState<string | null>(null)

  if (colors.length === 0) return null

  async function handleCopy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(hex)
      setTimeout(() => setCopied((current) => (current === hex ? null : current)), 1500)
    } catch {
      // clipboard API unavailable — silently ignore, the hex is still visible to copy by hand
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((hex) => (
        <button
          key={hex}
          onClick={() => handleCopy(hex)}
          className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]
            py-1.5 pl-1.5 pr-3 text-xs font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-raised)]"
        >
          <span className="size-5 rounded-full border border-[var(--color-border)]" style={{ background: hex }} />
          {hex.toUpperCase()}
          {copied === hex ? <Check size={13} className="text-[var(--color-naipe-tenor)]" /> : <Copy size={13} className="text-[var(--color-text-muted)]" />}
        </button>
      ))}
    </div>
  )
}
