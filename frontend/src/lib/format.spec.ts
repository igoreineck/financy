import { describe, expect, it } from 'vitest'
import { formatCurrencyCents, formatDate, parseCurrencyToCents } from './format'

describe('formatCurrencyCents', () => {
  it('formats simple cents with two decimals', () => {
    expect(formatCurrencyCents(1234)).toBe('R$ 12,34')
  })

  it('formats zero', () => {
    expect(formatCurrencyCents(0)).toBe('R$ 0,00')
  })

  it('formats values past a thousand with dot as thousand separator', () => {
    expect(formatCurrencyCents(1234567)).toBe('R$ 12.345,67')
  })

  it('pads single-digit cents with zero', () => {
    expect(formatCurrencyCents(105)).toBe('R$ 1,05')
  })

  it('keeps the sign for negative values', () => {
    expect(formatCurrencyCents(-1234)).toBe('-R$ 12,34')
  })
})

describe('parseCurrencyToCents', () => {
  it('parses a prefixed string into cents', () => {
    expect(parseCurrencyToCents('R$ 12,34')).toBe(1234)
  })

  it('parses without prefix', () => {
    expect(parseCurrencyToCents('12,34')).toBe(1234)
  })

  it('parses values with thousand separators', () => {
    expect(parseCurrencyToCents('R$ 12.345,67')).toBe(1234567)
  })

  it('parses just digits as cents', () => {
    expect(parseCurrencyToCents('100')).toBe(10000)
  })

  it('handles missing decimal part', () => {
    expect(parseCurrencyToCents('R$ 5')).toBe(500)
  })
})

describe('formatDate', () => {
  it('renders an ISO UTC timestamp as dd/mm/yy', () => {
    expect(formatDate('2025-11-30T00:00:00Z')).toBe('30/11/25')
  })

  it('pads single-digit day and month', () => {
    expect(formatDate('2025-01-05T12:00:00Z')).toBe('05/01/25')
  })
})
