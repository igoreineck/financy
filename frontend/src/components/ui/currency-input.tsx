import { formatCurrencyCents } from '@/lib/format'
import { type ComponentProps, forwardRef } from 'react'
import { Input } from './input'

type CurrencyInputProps = Omit<
  ComponentProps<typeof Input>,
  'value' | 'onChange' | 'defaultValue' | 'type'
> & {
  value?: number
  onChange?: (cents: number) => void
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onChange, inputMode, ...props }, ref) {
    return (
      <Input
        ref={ref}
        inputMode={inputMode ?? 'numeric'}
        {...props}
        value={formatCurrencyCents(value ?? 0)}
        onChange={e => {
          const digits = e.target.value.replace(/\D/g, '')
          onChange?.(Number(digits || '0'))
        }}
      />
    )
  },
)
