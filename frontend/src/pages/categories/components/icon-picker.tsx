import { cn } from '@/lib/utils'
import { type CategoryIconName, PICKER_ICON_NAMES, iconMap } from '../icon-map'

type IconPickerProps = {
  value: CategoryIconName | null
  onChange: (icon: CategoryIconName) => void
  'aria-invalid'?: boolean
}

export function IconPicker({
  value,
  onChange,
  'aria-invalid': ariaInvalid,
}: IconPickerProps) {
  return (
    <div
      aria-label="Selecionar ícone"
      aria-invalid={ariaInvalid || undefined}
      className={cn(
        'grid grid-cols-8 gap-2',
        ariaInvalid && 'rounded-lg border border-danger p-1',
      )}
    >
      {PICKER_ICON_NAMES.map(name => {
        const Icon = iconMap[name]
        const selected = value === name
        return (
          <button
            key={name}
            type="button"
            aria-pressed={selected}
            aria-label={name}
            onClick={() => onChange(name)}
            className={cn(
              'inline-flex aspect-square w-full items-center justify-center rounded-lg border transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/40',
              selected
                ? 'border-brand-base bg-brand-base/10 text-brand-base'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100',
            )}
          >
            <Icon className="size-5" />
          </button>
        )
      })}
    </div>
  )
}
