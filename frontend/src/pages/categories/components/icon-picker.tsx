import { cn } from '@/lib/utils'
import { type CategoryIconName, ICON_NAMES, iconMap } from '../icon-map'

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
        'grid grid-cols-6 gap-2 rounded-lg border border-gray-200 bg-white p-3',
        ariaInvalid && 'border-danger',
      )}
    >
      {ICON_NAMES.map(name => {
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
              'inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
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
