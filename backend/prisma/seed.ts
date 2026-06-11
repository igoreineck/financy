import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const SEED_USER = {
  name: 'Conta Teste',
  email: 'conta@teste.com',
  password: 'senha123',
}

const CATEGORIES = [
  { name: 'Alimentação', color: 'orange', icon: 'utensils' },
  { name: 'Transporte', color: 'blue', icon: 'car-front' },
  { name: 'Lazer', color: 'purple', icon: 'ticket' },
  { name: 'Saúde', color: 'red', icon: 'heart-pulse' },
  { name: 'Moradia', color: 'yellow', icon: 'house' },
  { name: 'Compras', color: 'pink', icon: 'shopping-cart' },
  { name: 'Educação', color: 'green', icon: 'book-open' },
  { name: 'Trabalho', color: 'gray', icon: 'briefcase-business' },
  { name: 'Pets', color: 'orange', icon: 'paw-print' },
  { name: 'Investimentos', color: 'green', icon: 'piggy-bank' },
]

type CategoryDescriptors = {
  expenseDescriptions: string[]
  incomeDescriptions: string[]
  expenseRange: [number, number]
  incomeRange: [number, number]
  incomeBias: number
}

const CATEGORY_PROFILE: Record<string, CategoryDescriptors> = {
  Alimentação: {
    expenseDescriptions: [
      'Supermercado',
      'Almoço executivo',
      'Padaria',
      'Delivery',
      'Restaurante',
      'Hortifruti',
    ],
    incomeDescriptions: [],
    expenseRange: [2500, 35000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Transporte: {
    expenseDescriptions: [
      'Combustível',
      'Uber',
      'Recarga Bilhete Único',
      'Estacionamento',
      'Pedágio',
      'Revisão do carro',
    ],
    incomeDescriptions: [],
    expenseRange: [1500, 40000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Lazer: {
    expenseDescriptions: [
      'Cinema',
      'Streaming Netflix',
      'Streaming Spotify',
      'Bar com amigos',
      'Viagem fim de semana',
      'Show',
    ],
    incomeDescriptions: [],
    expenseRange: [2000, 60000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Saúde: {
    expenseDescriptions: [
      'Farmácia',
      'Plano de saúde',
      'Consulta médica',
      'Academia',
      'Dentista',
      'Exames',
    ],
    incomeDescriptions: [],
    expenseRange: [3000, 80000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Moradia: {
    expenseDescriptions: [
      'Aluguel',
      'Conta de luz',
      'Conta de água',
      'Internet',
      'Gás',
      'Condomínio',
    ],
    incomeDescriptions: [],
    expenseRange: [8000, 250000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Compras: {
    expenseDescriptions: [
      'Roupas',
      'Eletrônico',
      'Presente',
      'Livraria',
      'Cosméticos',
      'Loja de departamento',
    ],
    incomeDescriptions: ['Estorno de compra'],
    expenseRange: [4000, 120000],
    incomeRange: [2000, 20000],
    incomeBias: 0.1,
  },
  Educação: {
    expenseDescriptions: [
      'Mensalidade do curso',
      'Material didático',
      'Plataforma de cursos',
      'Workshop',
      'Certificação',
    ],
    incomeDescriptions: ['Bolsa de estudos'],
    expenseRange: [5000, 90000],
    incomeRange: [50000, 120000],
    incomeBias: 0.15,
  },
  Trabalho: {
    expenseDescriptions: [
      'Coworking',
      'Software / SaaS',
      'Equipamento de escritório',
    ],
    incomeDescriptions: ['Salário', 'Freelance', 'Bônus', 'Reembolso'],
    expenseRange: [3000, 60000],
    incomeRange: [50000, 800000],
    incomeBias: 0.65,
  },
  Pets: {
    expenseDescriptions: [
      'Ração',
      'Veterinário',
      'Pet shop',
      'Banho e tosa',
      'Brinquedo',
    ],
    incomeDescriptions: [],
    expenseRange: [3500, 40000],
    incomeRange: [0, 0],
    incomeBias: 0,
  },
  Investimentos: {
    expenseDescriptions: ['Aporte CDB', 'Aporte Tesouro Direto', 'Aporte ETF'],
    incomeDescriptions: [
      'Dividendos',
      'Rendimento CDB',
      'Resgate Tesouro Direto',
    ],
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

  const trabalho = categories.find(c => c.name === 'Trabalho')
  if (trabalho) {
    for (const { offset } of MONTH_PLAN) {
      rows.push({
        userId: user.id,
        categoryId: trabalho.id,
        description: 'Salário',
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

  console.log('Seed concluído:')
  console.log(`  user      → ${user.email} (senha: ${SEED_USER.password})`)
  console.log(`  categorias → ${categories.length}`)
  console.log(`  transações → ${total}`)
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
