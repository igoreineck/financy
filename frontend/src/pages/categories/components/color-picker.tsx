import type { TagColor } from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import { COLOR_NAMES, swatchClassFor } from '../color-map'

type ColorPickerProps = {
  value: TagColor | null
  onChange: (color: TagColor) => void
  'aria-invalid'?: boolean
}

export function ColorPicker({
  value,
  onChange,
  'aria-invalid': ariaInvalid,
}: ColorPickerProps) {
  return (
    <div
      aria-label="Selecionar cor"
      aria-invalid={ariaInvalid || undefined}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3',
        ariaInvalid && 'border-danger',
      )}
    >
      {COLOR_NAMES.map(color => {
        const selected = value === color
        return (
          <button
            key={color}
            type="button"
            aria-pressed={selected}
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-full transition-transform',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/40',
              selected && 'outline-2 outline-offset-2 outline-gray-800',
            )}
          >
            <span
              className={cn('block size-6 rounded-full', swatchClassFor(color))}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}
