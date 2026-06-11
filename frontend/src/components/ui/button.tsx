import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/40 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        solid:
          'bg-brand-base text-white hover:bg-brand-dark disabled:bg-brand-base/40 disabled:text-white',
        outline:
          'border border-gray-300 bg-white text-gray-700 hover:bg-gray-200 disabled:border-gray-200 disabled:bg-white disabled:text-gray-400',
      },
      size: {
        md: 'h-12 px-6 text-sm',
        sm: 'h-10 px-4 text-sm',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { buttonVariants }
