import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export function CostumeGallery({ photos }: { photos: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (photos.length === 0) return null

  function close() {
    setOpenIndex(null)
  }

  function step(delta: number) {
    setOpenIndex((current) => {
      if (current === null) return current
      return (current + delta + photos.length) % photos.length
    })
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((url, index) => (
          <button
            key={url}
            onClick={() => setOpenIndex(index)}
            className="aspect-square overflow-hidden rounded-[var(--radius-control)] border border-[var(--color-border)]"
          >
            <img src={url} alt="" className="size-full object-cover" />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  step(-1)
                }}
                aria-label="Foto anterior"
                className="absolute left-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  step(1)
                }}
                aria-label="Próxima foto"
                className="absolute right-4 flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <img
            src={photos[openIndex]}
            alt=""
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
