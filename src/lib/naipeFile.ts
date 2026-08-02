import type { Naipe, NaipeFileMap } from '../types/domain'

export function naipeFileKey(naipe: Naipe): keyof NaipeFileMap {
  return naipe === 'geral' ? 'full' : naipe
}
