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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transações</h1>
          <p className="text-sm text-gray-500">
            Gerencie suas entradas e saídas
          </p>
        </div>
        <Button onClick={() => setDialogState({ mode: 'create' })}>
          <Plus className="size-4" /> Nova transação
        </Button>
      </header>

      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {loading ? (
        <p className="text-sm text-gray-500">Carregando transações...</p>
      ) : transactions.length === 0 ? (
        <EmptyState onCreate={() => setDialogState({ mode: 'create' })} />
      ) : rows.length === 0 ? (
        <FilterEmptyState />
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-right">Ações</th>
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
              {start} a {end} | {total} resultados
            </span>
            <div className="flex items-center gap-2">
              <PaginationButton
                aria-label="Página anterior"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="size-4" />
              </PaginationButton>
              <span className="text-xs text-gray-500">
                Página {page} de {totalPages}
              </span>
              <PaginationButton
                aria-label="Próxima página"
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

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-base/10 text-brand-base">
        <Wallet className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-gray-800">
          Nenhuma transação ainda
        </h2>
        <p className="text-sm text-gray-500">
          Registre sua primeira transação para começar
        </p>
      </div>
      <Button onClick={onCreate}>
        <Plus className="size-4" /> Nova transação
      </Button>
    </div>
  )
}

function FilterEmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <h2 className="text-base font-semibold text-gray-800">
        Nenhum resultado
      </h2>
      <p className="text-sm text-gray-500">
        Ajuste os filtros para ver outras transações
      </p>
    </div>
  )
}
