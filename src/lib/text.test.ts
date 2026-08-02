import { describe, expect, it } from 'vitest'
import { matchesSearch, normalizeForSearch } from './text'

describe('normalizeForSearch', () => {
  it('strips accents and lowercases', () => {
    expect(normalizeForSearch('Coração')).toBe('coracao')
    expect(normalizeForSearch('É Preciso Saber Viver')).toBe('e preciso saber viver')
  })
})

describe('matchesSearch', () => {
  it('matches ignoring accents and case', () => {
    expect(matchesSearch('Ave Maria', 'ave maria')).toBe(true)
    expect(matchesSearch('Só Vou Contar Pra Você', 'so vou')).toBe(true)
    expect(matchesSearch('Coração', 'coraçao')).toBe(true)
  })

  it('returns false when the query is not found', () => {
    expect(matchesSearch('Ave Maria', 'canção nova')).toBe(false)
  })

  it('treats an empty query as matching everything', () => {
    expect(matchesSearch('Qualquer Música', '')).toBe(true)
  })
})
