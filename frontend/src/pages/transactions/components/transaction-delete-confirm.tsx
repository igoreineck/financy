import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeleteTransactionDocument } from '@/gql/graphql'
import type { Reference } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'

type TransactionDeleteConfirmProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: { id: string; description: string } | null
}

export function TransactionDeleteConfirm({
  open,
  onOpenChange,
  transaction,
}: TransactionDeleteConfirmProps) {
  const [deleteTransaction, { loading }] = useMutation(
    DeleteTransactionDocument,
    {
      update(cache, { data }) {
        if (!data?.deleteTransaction || !transaction) return
        const removedRef = cache.identify({
          __typename: 'TransactionModel',
          id: transaction.id,
        })
        cache.modify({
          fields: {
            listTransactions(existing: Reference[], { readField }) {
              return existing.filter(
                ref => readField('id', ref) !== transaction.id,
              )
            },
          },
        })
        if (removedRef) cache.evict({ id: removedRef })
        cache.gc()
      },
    },
  )

  async function handleConfirm() {
    if (!transaction) return
    try {
      await deleteTransaction({ variables: { id: transaction.id } })
      toast.success('Transaction deleted')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete transaction?</DialogTitle>
          <DialogDescription>
            This action cannot be undone.
            {transaction
              ? ` "${transaction.description}" will be removed.`
              : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-danger hover:bg-danger/90"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
