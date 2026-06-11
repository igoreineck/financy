import { Eye, EyeOff, Lock } from 'lucide-react'
import { type ComponentProps, forwardRef, useState } from 'react'
import { Input } from './input'

type PasswordInputProps = Omit<
  ComponentProps<typeof Input>,
  'icon' | 'suffix' | 'type'
>

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [visible, setVisible] = useState(false)
    return (
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        icon={<Lock />}
        suffix={
          <button
            type="button"
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={visible}
            onClick={() => setVisible(v => !v)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/40"
          >
            {visible ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        }
        {...props}
      />
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
