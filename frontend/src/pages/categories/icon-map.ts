import {
  BaggageClaim,
  BookOpen,
  BriefcaseBusiness,
  CarFront,
  Dumbbell,
  Gift,
  HeartPulse,
  House,
  type LucideIcon,
  Mailbox,
  PawPrint,
  PiggyBank,
  ReceiptText,
  ShoppingBasket,
  ShoppingCart,
  Tag,
  Ticket,
  ToolCase,
  Utensils,
  Wallet,
} from 'lucide-react'

export const iconMap = {
  'briefcase-business': BriefcaseBusiness,
  'car-front': CarFront,
  'heart-pulse': HeartPulse,
  'piggy-bank': PiggyBank,
  'shopping-cart': ShoppingCart,
  ticket: Ticket,
  'tool-case': ToolCase,
  utensils: Utensils,
  'paw-print': PawPrint,
  house: House,
  gift: Gift,
  dumbbell: Dumbbell,
  'book-open': BookOpen,
  'shopping-basket': ShoppingBasket,
  wallet: Wallet,
  'receipt-text': ReceiptText,
  'baggage-claim': BaggageClaim,
  mailbox: Mailbox,
  tag: Tag,
} as const satisfies Record<string, LucideIcon>

export type CategoryIconName = keyof typeof iconMap

export const ICON_NAMES = Object.keys(iconMap) as CategoryIconName[]

export const PICKER_ICON_NAMES: CategoryIconName[] = [
  'briefcase-business',
  'car-front',
  'heart-pulse',
  'piggy-bank',
  'shopping-cart',
  'ticket',
  'tool-case',
  'utensils',
  'paw-print',
  'house',
  'gift',
  'dumbbell',
  'book-open',
  'shopping-basket',
  'mailbox',
  'receipt-text',
]

export function isCategoryIcon(value: string): value is CategoryIconName {
  return value in iconMap
}
