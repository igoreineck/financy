import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'

const tagVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      color: {
        gray: 'bg-gray-200 text-gray-700',
        blue: 'bg-blue-light text-blue-base',
        purple: 'bg-purple-light text-purple-base',
        pink: 'bg-pink-light text-pink-base',
        red: 'bg-red-light text-red-base',
        orange: 'bg-orange-light text-orange-base',
        yellow: 'bg-yellow-light text-yellow-dark',
        green: 'bg-green-light text-green-base',
      },
    },
    defaultVariants: {
      color: 'gray',
    },
  },
)

export type TagColor = NonNullable<VariantProps<typeof tagVariants>['color']>

type TagProps = ComponentProps<'span'> & VariantProps<typeof tagVariants>

export function Tag({ className, color, ...props }: TagProps) {
  return <span className={cn(tagVariants({ color }), className)} {...props} />
}

export { tagVariants }
