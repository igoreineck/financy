export function formatCurrencyCents(cents: number): string {
  const abs = Math.abs(Math.trunc(cents))
  const integer = Math.floor(abs / 100)
  const decimals = String(abs % 100).padStart(2, '0')
  const integerWithThousands = integer
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const sign = cents < 0 ? '-' : ''
  return `${sign}R$ ${integerWithThousands},${decimals}`
}

export function parseCurrencyToCents(input: string): number {
  const sign = input.trim().startsWith('-') ? -1 : 1
  const cleaned = input.replace(/[^\d,]/g, '')
  if (cleaned === '') return 0
  const [intPart = '0', decPart = ''] = cleaned.split(',')
  const decimals = `${decPart}00`.slice(0, 2)
  return sign * (Number(intPart) * 100 + Number(decimals))
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  const day = String(date.getUTCDate()).padStart(2, '0')
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const year = String(date.getUTCFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

export function toIsoDate(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
