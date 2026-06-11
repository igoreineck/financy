import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'

const iconButtonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-base/40 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        outline:
          'border-gray-300 bg-white text-gray-700 hover:bg-gray-200 disabled:bg-white disabled:text-gray-400',
        danger:
          'border-red-light bg-white text-danger hover:bg-red-light disabled:bg-white',
      },
      size: {
        md: 'h-10 w-10 [&_svg]:size-5',
        sm: 'h-9 w-9 [&_svg]:size-4',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
    },
  },
)

type IconButtonProps = ComponentProps<'button'> &
  VariantProps<typeof iconButtonVariants>

export function IconButton({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { iconButtonVariants }
