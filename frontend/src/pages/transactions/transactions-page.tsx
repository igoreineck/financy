import { Button } from '@/components/ui/button'
import { PaginationButton } from '@/components/ui/pagination-button'
import { ListCategoriesDocument, ListTransactionsDocument } from '@/gql/graphql'
import { useQuery } from '@apollo/client/react'
import { ChevronLeft, ChevronRight, Plus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { TransactionDeleteConfirm } from './components/transaction-delete-confirm'
import {
  TransactionDialog,
  type TransactionDialogValues,
} from './components/transaction-dialog'
import { TransactionFilters } from './components/transaction-filters'
import { TransactionRow } from './components/transaction-row'
import {
  type TransactionFilters as Filters,
  defaultFilters,
  useFilteredTransactions,
} from './hooks/use-filtered-transactions'

const PAGE_SIZE = 10

export function TransactionsPage() {
  const { data: transactionsData, loading } = useQuery(ListTransactionsDocument)
  const { data: categoriesData } = useQuery(ListCategoriesDocument)

  const transactions = transactionsData?.listTransactions ?? []
  const categories = categoriesData?.listCategories ?? []

  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const { rows, total, totalPages, page, setPage } = useFilteredTransactions(
    transactions,
    filters,
    PAGE_SIZE,
  )

  const [dialogState, setDialogState] = useState<
    | { mode: 'create' }
    | { mode: 'edit'; values: TransactionDialogValues }
    | null
  >(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    description: string
  } | null>(null)

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500">
            Manage all your financial transactions
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogState({ mode: 'create' })}>
          <Plus className="size-4" /> New transaction
        </Button>
      </header>

      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {loading ? (
        <p className="text-sm text-gray-500">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <EmptyState />
      ) : rows.length === 0 ? (
        <FilterEmptyState />
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-normal">Description</th>
                  <th className="px-4 py-3 font-normal">Date</th>
                  <th className="px-4 py-3 font-normal">Category</th>
                  <th className="px-4 py-3 font-normal">Type</th>
                  <th className="px-4 py-3 text-right font-normal">Amount</th>
                  <th className="px-4 py-3 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(transaction => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={() =>
                      setDialogState({
                        mode: 'edit',
                        values: {
                          id: transaction.id,
                          description: transaction.description,
                          amount: transaction.amount,
                          type: transaction.type,
                          occurredAt: transaction.occurredAt,
                          categoryId: transaction.categoryId,
                        },
                      })
                    }
                    onDelete={() =>
                      setDeleteTarget({
                        id: transaction.id,
                        description: transaction.description,
                      })
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-gray-500">
              {start} to {end} | {total} results
            </span>
            <div className="flex items-center gap-2">
              <PaginationButton
                aria-label="Previous page"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="size-4" />
              </PaginationButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <PaginationButton
                  key={p}
                  aria-label={`Page ${p}`}
                  active={p === page}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationButton>
              ))}
              <PaginationButton
                aria-label="Next page"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="size-4" />
              </PaginationButton>
            </div>
          </div>
        </div>
      )}

      {dialogState ? (
        <TransactionDialog
          open
          onOpenChange={open => {
            if (!open) setDialogState(null)
          }}
          mode={dialogState.mode}
          initialValues={
            dialogState.mode === 'edit' ? dialogState.values : undefined
          }
        />
      ) : null}

      <TransactionDeleteConfirm
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null)
        }}
        transaction={deleteTarget}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-base/10 text-brand-base">
        <Wallet className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-gray-800">
          No transactions yet
        </h2>
        <p className="text-sm text-gray-500">
          Record your first transaction to get started
        </p>
      </div>
    </div>
  )
}

function FilterEmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <h2 className="text-base font-semibold text-gray-800">No results</h2>
      <p className="text-sm text-gray-500">
        Adjust the filters to see other transactions
      </p>
    </div>
  )
}
