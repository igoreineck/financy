import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, graphql } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TransactionDeleteConfirm } from './transaction-delete-confirm'

function renderConfirm({
  onOpenChange = vi.fn(),
}: { onOpenChange?: (open: boolean) => void } = {}) {
  return render(
    <ApolloProvider client={apolloClient}>
      <TransactionDeleteConfirm
        open
        onOpenChange={onOpenChange}
        transaction={{ id: 't1', description: 'Mercado' }}
      />
      <Toaster />
    </ApolloProvider>,
  )
}

afterEach(async () => {
  await apolloClient.clearStore()
})

describe('<TransactionDeleteConfirm />', () => {
  it('cancel closes without firing the mutation', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderConfirm({ onOpenChange })

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('confirm calls the mutation and closes', async () => {
    const captured: unknown[] = []
    server.use(
      graphql.mutation('DeleteTransaction', async ({ variables }) => {
        captured.push(variables)
        return HttpResponse.json({ data: { deleteTransaction: true } })
      }),
    )

    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderConfirm({ onOpenChange })

    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    await screen.findByText('Transação excluída')

    expect(captured[0]).toEqual({ id: 't1' })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('surfaces backend errors as a toast', async () => {
    server.use(
      graphql.mutation('DeleteTransaction', () =>
        HttpResponse.json({
          errors: [{ message: 'Falha ao excluir transação' }],
        }),
      ),
    )

    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderConfirm({ onOpenChange })

    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(
      await screen.findByText('Falha ao excluir transação'),
    ).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
