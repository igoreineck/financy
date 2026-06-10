import type { TagColor } from '@/components/ui/tag'

export const COLOR_NAMES: TagColor[] = [
  'gray',
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'green',
]

export function isCategoryColor(value: string): value is TagColor {
  return (COLOR_NAMES as string[]).includes(value)
}

const swatchClass: Record<TagColor, string> = {
  gray: 'bg-gray-400',
  blue: 'bg-blue-base',
  purple: 'bg-purple-base',
  pink: 'bg-pink-base',
  red: 'bg-red-base',
  orange: 'bg-orange-base',
  yellow: 'bg-yellow-base',
  green: 'bg-green-base',
}

const iconBgClass: Record<TagColor, string> = {
  gray: 'bg-gray-200 text-gray-700',
  blue: 'bg-blue-light text-blue-base',
  purple: 'bg-purple-light text-purple-base',
  pink: 'bg-pink-light text-pink-base',
  red: 'bg-red-light text-red-base',
  orange: 'bg-orange-light text-orange-base',
  yellow: 'bg-yellow-light text-yellow-dark',
  green: 'bg-green-light text-green-base',
}

export function swatchClassFor(color: TagColor): string {
  return swatchClass[color]
}

export function iconBgClassFor(color: TagColor): string {
  return iconBgClass[color]
}
