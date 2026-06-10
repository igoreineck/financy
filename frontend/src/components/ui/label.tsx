import { cn } from '@/lib/utils'
import * as RadixLabel from '@radix-ui/react-label'
import { type VariantProps, cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'

const labelVariants = cva('text-sm font-medium transition-colors', {
  variants: {
    state: {
      default: 'text-gray-700',
      active: 'text-brand-base',
      error: 'text-danger',
      disabled: 'text-gray-400',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

type LabelProps = ComponentProps<typeof RadixLabel.Root> &
  VariantProps<typeof labelVariants>

export function Label({ className, state, ...props }: LabelProps) {
  return (
    <RadixLabel.Root
      className={cn(labelVariants({ state }), className)}
      {...props}
    />
  )
}
