import { cn } from '@/lib/utils'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

export const Select = SelectPrimitive.Root
export const SelectGroup = SelectPrimitive.Group
export const SelectValue = SelectPrimitive.Value

type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger> & {
  icon?: ReactNode
  error?: boolean
}

export function SelectTrigger({
  className,
  children,
  icon,
  error,
  disabled,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      disabled={disabled}
      data-state-error={error || undefined}
      className={cn(
        'group flex h-12 w-full items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 text-left text-sm text-gray-800 transition-colors',
        'data-[state=open]:border-brand-base',
        'data-state-error:border-danger',
        'focus:outline-none focus-visible:border-brand-base',
        'disabled:cursor-not-allowed disabled:bg-gray-100',
        'data-placeholder:text-gray-400',
        className,
      )}
      {...props}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className={cn(
            'flex size-5 items-center justify-center text-gray-400 transition-colors',
            'group-data-[state=open]:text-brand-base',
            'group-data-state-error:text-danger',
            '[&_svg]:size-5',
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex-1 truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 text-gray-500" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          'relative z-50 min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          position === 'popper' && 'translate-y-1',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-md px-3 py-2 pr-8 text-sm text-gray-800 outline-none',
        'data-highlighted:bg-gray-100',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2 flex size-4 items-center justify-center text-brand-base">
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
