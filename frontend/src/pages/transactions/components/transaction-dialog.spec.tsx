import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, graphql } from 'msw'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import {
  TransactionDialog,
  type TransactionDialogValues,
} from './transaction-dialog'

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false) as never
  Element.prototype.releasePointerCapture = vi.fn() as never
  Element.prototype.scrollIntoView = vi.fn() as never
})

const categories = [
  {
    __typename: 'CategoryModel',
    id: 'c1',
    name: 'Alimentação',
    description: null,
    icon: 'utensils',
    color: 'orange',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    __typename: 'CategoryModel',
    id: 'c2',
    name: 'Salário',
    description: null,
    icon: 'wallet',
    color: 'green',
    createdAt: '2025-01-01T00:00:00Z',
  },
]

function seedCategories() {
  server.use(
    graphql.query('ListCategories', () =>
      HttpResponse.json({ data: { listCategories: categories } }),
    ),
  )
}

function renderDialog({
  mode = 'create' as 'create' | 'edit',
  initialValues,
  onOpenChange = vi.fn(),
}: {
  mode?: 'create' | 'edit'
  initialValues?: TransactionDialogValues
  onOpenChange?: (open: boolean) => void
} = {}) {
  return render(
    <ApolloProvider client={apolloClient}>
      <TransactionDialog
        open
        onOpenChange={onOpenChange}
        mode={mode}
        initialValues={initialValues}
      />
      <Toaster />
    </ApolloProvider>,
  )
}

afterEach(async () => {
  await apolloClient.clearStore()
})

describe('<TransactionDialog />', () => {
  it('toggles between Despesa and Receita marking the active option', async () => {
    seedCategories()
    const user = userEvent.setup()
    renderDialog()

    const despesa = screen.getByRole('button', { name: /Despesa/i })
    const receita = screen.getByRole('button', { name: /Receita/i })

    expect(despesa).toHaveAttribute('aria-pressed', 'true')
    expect(despesa).toHaveClass('border-danger')
    expect(receita).toHaveAttribute('aria-pressed', 'false')

    await user.click(receita)
    expect(receita).toHaveAttribute('aria-pressed', 'true')
    expect(receita).toHaveClass('border-success')
    expect(despesa).toHaveAttribute('aria-pressed', 'false')
  })

  it('emits the typed amount as cents through the CurrencyInput', async () => {
    seedCategories()
    const user = userEvent.setup()
    renderDialog()

    const amount = screen.getByLabelText('Valor')
    await user.type(amount, '12,34')
    expect(amount).toHaveValue('R$ 12,34')
  })

  it('blocks submit when required fields are missing', async () => {
    seedCategories()
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Descrição obrigatória')).toBeInTheDocument()
    expect(
      screen.getByText('Valor deve ser maior que zero'),
    ).toBeInTheDocument()
    expect(screen.getByText('Data obrigatória')).toBeInTheDocument()
    expect(screen.getByText('Selecione uma categoria')).toBeInTheDocument()
  })

  it('submits a valid form with the expected mutation payload', async () => {
    seedCategories()
    const captured: unknown[] = []
    server.use(
      graphql.mutation('CreateTransaction', async ({ variables }) => {
        captured.push(variables)
        return HttpResponse.json({
          data: {
            createTransaction: {
              __typename: 'TransactionModel',
              id: 'new-1',
              description: 'Mercado',
              amount: 1234,
              type: 'EXPENSE',
              occurredAt: '2025-11-10T00:00:00.000Z',
              categoryId: 'c1',
              category: {
                __typename: 'CategoryModel',
                id: 'c1',
                name: 'Alimentação',
                color: 'orange',
                icon: 'utensils',
              },
            },
          },
        })
      }),
      graphql.query('ListTransactions', () =>
        HttpResponse.json({ data: { listTransactions: [] } }),
      ),
    )

    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog({ onOpenChange })

    await user.type(screen.getByLabelText('Descrição'), 'Mercado')
    await user.type(screen.getByLabelText('Valor'), '1234')
    await user.type(screen.getByLabelText('Data'), '2025-11-10')

    await user.click(screen.getByRole('combobox', { name: 'Categoria' }))
    await user.click(await screen.findByRole('option', { name: 'Alimentação' }))

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await screen.findByText('Transação criada')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(captured[0]).toEqual({
      data: {
        description: 'Mercado',
        amount: 1234,
        type: 'EXPENSE',
        categoryId: 'c1',
        occurredAt: '2025-11-10T00:00:00.000Z',
      },
    })
  })

  it('pre-populates everything in edit mode (including the selected category)', async () => {
    seedCategories()
    renderDialog({
      mode: 'edit',
      initialValues: {
        id: 't1',
        description: 'Almoço',
        amount: 4500,
        type: 'EXPENSE',
        occurredAt: '2025-11-08T00:00:00Z',
        categoryId: 'c1',
      },
    })

    expect(screen.getByLabelText('Descrição')).toHaveValue('Almoço')
    expect(screen.getByLabelText('Valor')).toHaveValue('R$ 45,00')
    expect(screen.getByLabelText('Data')).toHaveValue('2025-11-08')
    const trigger = await screen.findByRole('combobox', { name: 'Categoria' })
    await waitFor(() => expect(trigger).toHaveTextContent('Alimentação'))
  })
})
