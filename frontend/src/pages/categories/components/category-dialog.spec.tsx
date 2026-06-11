import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, graphql } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CategoryDialog, type CategoryDialogValues } from './category-dialog'

function renderDialog({
  mode = 'create' as 'create' | 'edit',
  initialValues,
  onOpenChange = vi.fn(),
}: {
  mode?: 'create' | 'edit'
  initialValues?: CategoryDialogValues
  onOpenChange?: (open: boolean) => void
} = {}) {
  return render(
    <ApolloProvider client={apolloClient}>
      <CategoryDialog
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

describe('<CategoryDialog />', () => {
  it('renders in create mode with empty fields', () => {
    renderDialog()
    expect(
      screen.getByRole('heading', { name: 'Nova categoria' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Título')).toHaveValue('')
  })

  it('blocks submit when name, icon or color are missing', async () => {
    const user = userEvent.setup()
    renderDialog()
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByText('Título obrigatório')).toBeInTheDocument()
    expect(screen.getByText('Selecione um ícone')).toBeInTheDocument()
    expect(screen.getByText('Selecione uma cor')).toBeInTheDocument()
  })

  it('pre-populates fields in edit mode', () => {
    renderDialog({
      mode: 'edit',
      initialValues: {
        id: 'c1',
        name: 'Alimentação',
        description: 'Comida em geral',
        icon: 'utensils',
        color: 'orange',
      },
    })
    expect(screen.getByLabelText('Título')).toHaveValue('Alimentação')
    expect(screen.getByLabelText('Descrição')).toHaveValue('Comida em geral')
    expect(screen.getByRole('button', { name: 'utensils' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'orange' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('calls the create mutation with the right input and closes', async () => {
    const captured: unknown[] = []
    server.use(
      graphql.mutation('CreateCategory', async ({ variables }) => {
        captured.push(variables)
        return HttpResponse.json({
          data: {
            createCategory: {
              __typename: 'CategoryModel',
              id: 'new-id',
              name: 'Lazer',
              description: null,
              icon: 'ticket',
              color: 'purple',
              createdAt: new Date().toISOString(),
            },
          },
        })
      }),
      graphql.query('ListCategories', () =>
        HttpResponse.json({ data: { listCategories: [] } }),
      ),
    )

    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    renderDialog({ onOpenChange })

    await user.type(screen.getByLabelText('Título'), 'Lazer')
    await user.click(screen.getByRole('button', { name: 'ticket' }))
    await user.click(screen.getByRole('button', { name: 'purple' }))
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await screen.findByText('Categoria criada')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(captured[0]).toEqual({
      data: {
        name: 'Lazer',
        description: null,
        icon: 'ticket',
        color: 'purple',
      },
    })
  })

  it('closes via the X button without calling any mutation', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderDialog({ onOpenChange })

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
