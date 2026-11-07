import { Toaster } from '@/components/ui/sonner'
import { apolloClient } from '@/lib/apollo'
import { server } from '@/test/msw/server'
import { ApolloProvider } from '@apollo/client/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, graphql } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CategoryDeleteConfirm } from './category-delete-confirm'

function renderConfirm({
  onOpenChange = vi.fn(),
}: { onOpenChange?: (open: boolean) => void } = {}) {
  return render(
    <ApolloProvider client={apolloClient}>
      <CategoryDeleteConfirm
        open
        onOpenChange={onOpenChange}
        category={{ id: 'c1', name: 'Alimentação' }}
      />
      <Toaster />
    </ApolloProvider>,
  )
}

afterEach(async () => {
  await apolloClient.clearStore()
})

describe('<CategoryDeleteConfirm />', () => {
  it('cancel closes without calling the mutation', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderConfirm({ onOpenChange })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('confirm calls the mutation and closes', async () => {
    const captured: unknown[] = []
    server.use(
      graphql.mutation('DeleteCategory', async ({ variables }) => {
        captured.push(variables)
        return HttpResponse.json({ data: { deleteCategory: true } })
      }),
    )

    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderConfirm({ onOpenChange })

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await screen.findByText('Category deleted')

    expect(captured[0]).toEqual({ id: 'c1' })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows a toast when the backend rejects the delete (FK)', async () => {
    server.use(
      graphql.mutation('DeleteCategory', () =>
        HttpResponse.json({
          errors: [
            {
              message: 'Não foi possível excluir: categoria possui transações',
            },
          ],
        }),
      ),
    )

    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    renderConfirm({ onOpenChange })

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(
      await screen.findByText(
        'Não foi possível excluir: categoria possui transações',
      ),
    ).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
