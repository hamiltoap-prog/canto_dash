import type { Naipe } from '../types/domain'

export const NAIPE_LABELS: Record<Naipe, string> = {
  geral: 'Geral',
  soprano: 'Soprano',
  contralto: 'Contralto',
  tenor: 'Tenor',
  baixo: 'Baixo',
  solo: 'Solo',
}

export const NAIPE_ORDER: Naipe[] = ['geral', 'soprano', 'contralto', 'tenor', 'baixo', 'solo']
