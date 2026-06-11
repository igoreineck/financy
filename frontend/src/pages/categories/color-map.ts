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

export const PICKER_COLOR_NAMES: TagColor[] = [
  'green',
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
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

const ringClass: Record<TagColor, string> = {
  gray: 'ring-gray-500',
  blue: 'ring-blue-base',
  purple: 'ring-purple-base',
  pink: 'ring-pink-base',
  red: 'ring-red-base',
  orange: 'ring-orange-base',
  yellow: 'ring-yellow-base',
  green: 'ring-green-base',
}

const textClass: Record<TagColor, string> = {
  gray: 'text-gray-700',
  blue: 'text-blue-base',
  purple: 'text-purple-base',
  pink: 'text-pink-base',
  red: 'text-red-base',
  orange: 'text-orange-base',
  yellow: 'text-yellow-dark',
  green: 'text-green-base',
}

export function swatchClassFor(color: TagColor): string {
  return swatchClass[color]
}

export function iconBgClassFor(color: TagColor): string {
  return iconBgClass[color]
}

export function ringClassFor(color: TagColor): string {
  return ringClass[color]
}

export function textClassFor(color: TagColor): string {
  return textClass[color]
}
