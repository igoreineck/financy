import type { TagColor } from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import { PICKER_COLOR_NAMES, ringClassFor, swatchClassFor } from '../color-map'

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
        'grid w-full grid-cols-7 gap-6',
        ariaInvalid && 'rounded-lg border border-danger p-1',
      )}
    >
      {PICKER_COLOR_NAMES.map(color => {
        const selected = value === color
        return (
          <button
            key={color}
            type="button"
            aria-pressed={selected}
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              'inline-flex h-6 w-full cursor-pointer items-center justify-center rounded-md ring-2 ring-offset-4 transition-shadow',
              'focus-visible:outline-none focus-visible:ring-brand-base/40',
              swatchClassFor(color),
              selected ? ringClassFor(color) : 'ring-gray-200',
            )}
          />
        )
      })}
    </div>
  )
}
