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
  ShoppingCart,
  Tag,
  Ticket,
  ToolCase,
  Utensils,
  Wallet,
} from 'lucide-react'

export const iconMap = {
  'piggy-bank': PiggyBank,
  'briefcase-business': BriefcaseBusiness,
  utensils: Utensils,
  'shopping-cart': ShoppingCart,
  'car-front': CarFront,
  'heart-pulse': HeartPulse,
  ticket: Ticket,
  'tool-case': ToolCase,
  wallet: Wallet,
  tag: Tag,
  'book-open': BookOpen,
  gift: Gift,
  dumbbell: Dumbbell,
  house: House,
  'paw-print': PawPrint,
  'baggage-claim': BaggageClaim,
  mailbox: Mailbox,
  'receipt-text': ReceiptText,
} as const satisfies Record<string, LucideIcon>

export type CategoryIconName = keyof typeof iconMap

export const ICON_NAMES = Object.keys(iconMap) as CategoryIconName[]

export function isCategoryIcon(value: string): value is CategoryIconName {
  return value in iconMap
}
