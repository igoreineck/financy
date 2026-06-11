import { describe, expect, it } from 'vitest'
import { getInitials } from './initials'

describe('getInitials', () => {
  it('returns two letters for two names', () => {
    expect(getInitials('Conta Teste')).toBe('CT')
  })

  it('returns a single letter for a single name', () => {
    expect(getInitials('Igor')).toBe('I')
  })

  it('returns only the first two initials when more parts exist', () => {
    expect(getInitials('Igor Eineck Borges')).toBe('IE')
  })

  it('falls back to ? for empty strings', () => {
    expect(getInitials('')).toBe('?')
    expect(getInitials('   ')).toBe('?')
  })

  it('always uppercases the initials', () => {
    expect(getInitials('joão silva')).toBe('JS')
  })
})
