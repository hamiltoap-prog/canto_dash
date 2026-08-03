import { describe, expect, it } from 'vitest'
import { isLikelyValidUrl, normalizeExternalLink } from './externalLink'

describe('normalizeExternalLink', () => {
  it('rewrites Dropbox dl=0 to dl=1', () => {
    expect(normalizeExternalLink('https://www.dropbox.com/s/abc/musica.mp3?dl=0')).toBe(
      'https://www.dropbox.com/s/abc/musica.mp3?dl=1',
    )
  })

  it('appends dl=1 to a Dropbox link with no dl param', () => {
    expect(normalizeExternalLink('https://www.dropbox.com/s/abc/musica.mp3')).toBe(
      'https://www.dropbox.com/s/abc/musica.mp3?dl=1',
    )
  })

  it('leaves a Dropbox link already at dl=1 untouched', () => {
    expect(normalizeExternalLink('https://www.dropbox.com/s/abc/musica.mp3?dl=1')).toBe(
      'https://www.dropbox.com/s/abc/musica.mp3?dl=1',
    )
  })

  it('rewrites a Google Drive "view" link to a direct-download form', () => {
    expect(normalizeExternalLink('https://drive.google.com/file/d/FILE_ID_123/view?usp=sharing')).toBe(
      'https://drive.google.com/uc?export=download&id=FILE_ID_123',
    )
  })

  it('leaves unrecognized URLs untouched', () => {
    expect(normalizeExternalLink('https://example.com/musica.mp3')).toBe('https://example.com/musica.mp3')
  })
})

describe('isLikelyValidUrl', () => {
  it('accepts http/https URLs', () => {
    expect(isLikelyValidUrl('https://example.com/a.mp3')).toBe(true)
    expect(isLikelyValidUrl('http://example.com/a.mp3')).toBe(true)
  })

  it('rejects non-URLs and other protocols', () => {
    expect(isLikelyValidUrl('not a url')).toBe(false)
    expect(isLikelyValidUrl('ftp://example.com/a.mp3')).toBe(false)
    expect(isLikelyValidUrl('')).toBe(false)
  })
})
