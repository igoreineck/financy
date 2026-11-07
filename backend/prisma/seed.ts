import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const SEED_USER = {
  name: 'Test Account',
  email: 'conta@teste.com',
  password: 'senha123',
}

const CATEGORIES = [
  { name: 'Food', color: 'orange', icon: 'utensils' },
  { name: 'Transportation', color: 'blue', icon: 'car-front' },
  { name: 'Leisure', color: 'purple', icon: 'ticket' },
  { name: 'Health', color: 'red', icon: 'heart-pulse' },
  { name: 'Housing', color: 'yellow', icon: 'house' },
  { name: 'Shopping', color: 'pink', icon: 'shopping-cart' },
  { name: 'Education', color: 'green', icon: 'book-open' },
  { name: 'Work', color: 'gray', icon: 'briefcase-business' },
  { name: 'Pets', color: 'orange', icon: 'paw-print' },
  { name: 'Investments', color: 'green', icon: 'piggy-bank' },
]

type CategoryDescriptors = {
  expenseDescriptions: string[]
  incomeDescriptions: string[]
  expenseRange: [number, number]
  incomeRange: [number, number]
  incomeBias: number
}

const CATEGORY_PROFILE: Record<string, CategoryDescriptors> = {
  Food: {
    expenseDescriptions: [
      'Supermarket',
      'Business lunch',
      'Bakery',
      'Delivery',
      'Restaurant',
      'Produce market',
    ],
    incomeDescriptions: [],
    expenseRange: [2500, 35000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Transportation: {
    expenseDescriptions: [
      'Fuel',
      'Uber',
      'Transit card top-up',
      'Parking',
      'Toll',
      'Car service',
    ],
    incomeDescriptions: [],
    expenseRange: [1500, 40000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Leisure: {
    expenseDescriptions: [
      'Movies',
      'Streaming Netflix',
      'Streaming Spotify',
      'Drinks with friends',
      'Weekend trip',
      'Concert',
    ],
    incomeDescriptions: [],
    expenseRange: [2000, 60000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Health: {
    expenseDescriptions: [
      'Pharmacy',
      'Health insurance',
      'Doctor visit',
      'Gym',
      'Dentist',
      'Lab tests',
    ],
    incomeDescriptions: [],
    expenseRange: [3000, 80000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Housing: {
    expenseDescriptions: [
      'Rent',
      'Electricity bill',
      'Water bill',
      'Internet',
      'Gas',
      'HOA fee',
    ],
    incomeDescriptions: [],
    expenseRange: [8000, 250000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Shopping: {
    expenseDescriptions: [
      'Clothes',
      'Electronics',
      'Gift',
      'Bookstore',
      'Cosmetics',
      'Department store',
    ],
    incomeDescriptions: ['Purchase refund'],
    expenseRange: [4000, 120000],
    incomeRange: [2000, 20000],
    incomeBias: 0.1,
  },
  Education: {
    expenseDescriptions: [
      'Course tuition',
      'Study materials',
      'Online course platform',
      'Workshop',
      'Certification',
    ],
    incomeDescriptions: ['Scholarship'],
    expenseRange: [5000, 90000],
    incomeRange: [50000, 120000],
    incomeBias: 0.15,
  },
  Work: {
    expenseDescriptions: ['Coworking', 'Software / SaaS', 'Office equipment'],
    incomeDescriptions: ['Salary', 'Freelance', 'Bonus', 'Reimbursement'],
    expenseRange: [3000, 60000],
    incomeRange: [50000, 800000],
    incomeBias: 0.65,
  },
  Pets: {
    expenseDescriptions: ['Pet food', 'Vet', 'Pet shop', 'Grooming', 'Toy'],
    incomeDescriptions: [],
    expenseRange: [3500, 40000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Investments: {
    expenseDescriptions: [
      'CDB deposit',
      'Treasury bond deposit',
      'ETF deposit',
    ],
    incomeDescriptions: ['Dividends', 'CDB yield', 'Treasury bond redemption'],
    expenseRange: [10000, 500000],
    incomeRange: [1000, 60000],
    incomeBias: 0.45,
  },
}

function buildOccurredAt(monthOffset: number, dayOfMonth: number): Date {
  const now = new Date()
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + monthOffset,
      dayOfMonth,
      faker.number.int({ min: 8, max: 21 }),
      faker.number.int({ min: 0, max: 59 }),
    ),
  )
}

function pickAmount([min, max]: [number, number]): number {
  return faker.number.int({ min, max })
}

type MonthPlan = { offset: number; count: number }

const MONTH_PLAN: MonthPlan[] = [
  { offset: -3, count: 8 },
  { offset: -2, count: 12 },
  { offset: -1, count: 16 },
  { offset: 0, count: 24 },
  { offset: 1, count: 4 },
]

async function main() {
  faker.seed(42)

  const password = await hash(SEED_USER.password, 10)
  const email = SEED_USER.email.toLowerCase()

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: SEED_USER.name, password },
    create: { name: SEED_USER.name, email, password },
  })

  await prisma.transaction.deleteMany({ where: { userId: user.id } })
  await prisma.category.deleteMany({ where: { userId: user.id } })

  const categories = await Promise.all(
    CATEGORIES.map(c =>
      prisma.category.create({
        data: { ...c, userId: user.id },
      }),
    ),
  )

  type TxRow = {
    userId: string
    categoryId: string
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    occurredAt: Date
  }

  const rows: TxRow[] = []

  const work = categories.find(c => c.name === 'Work')
  if (work) {
    for (const { offset } of MONTH_PLAN) {
      rows.push({
        userId: user.id,
        categoryId: work.id,
        description: 'Salary',
        amount: faker.number.int({ min: 750_000, max: 820_000 }),
        type: 'INCOME',
        occurredAt: buildOccurredAt(offset, 5),
      })
    }
  }

  for (const { offset, count } of MONTH_PLAN) {
    for (let i = 0; i < count; i++) {
      const category = faker.helpers.arrayElement(categories)
      const profile = CATEGORY_PROFILE[category.name]
      if (!profile) continue

      const day = faker.number.int({ min: 1, max: 28 })
      const occurredAt = buildOccurredAt(offset, day)

      const isIncome =
        profile.incomeDescriptions.length > 0 &&
        faker.number.float({ min: 0, max: 1 }) < profile.incomeBias

      if (isIncome) {
        rows.push({
          userId: user.id,
          categoryId: category.id,
          description: faker.helpers.arrayElement(profile.incomeDescriptions),
          amount: pickAmount(profile.incomeRange),
          type: 'INCOME',
          occurredAt,
        })
      } else {
        rows.push({
          userId: user.id,
          categoryId: category.id,
          description: faker.helpers.arrayElement(profile.expenseDescriptions),
          amount: pickAmount(profile.expenseRange),
          type: 'EXPENSE',
          occurredAt,
        })
      }
    }
  }

  await prisma.transaction.createMany({ data: rows })

  const total = await prisma.transaction.count({ where: { userId: user.id } })

  console.log('Seed complete:')
  console.log(
    `  user         → ${user.email} (password: ${SEED_USER.password})`,
  )
  console.log(`  categories   → ${categories.length}`)
  console.log(`  transactions → ${total}`)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
