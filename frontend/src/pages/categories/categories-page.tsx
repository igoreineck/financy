import { Button } from '@/components/ui/button'
import {
  ListCategoriesDocument,
  ListTransactionsForStatsDocument,
} from '@/gql/graphql'
import { useQuery } from '@apollo/client/react'
import { FolderOpen, Plus, Receipt, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CategoryCard, type CategoryCardData } from './components/category-card'
import { CategoryDeleteConfirm } from './components/category-delete-confirm'
import {
  CategoryDialog,
  type CategoryDialogValues,
} from './components/category-dialog'
import { useCategoryStats } from './hooks/use-category-stats'

export function CategoriesPage() {
  const { data: categoriesData, loading } = useQuery(ListCategoriesDocument)
  const { data: transactionsData } = useQuery(ListTransactionsForStatsDocument)

  const categories = categoriesData?.listCategories ?? []
  const transactions = transactionsData?.listTransactions ?? []

  const stats = useCategoryStats(categories, transactions)

  const transactionCountByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of transactions) {
      map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + 1)
    }
    return map
  }, [transactions])

  const [dialogState, setDialogState] = useState<
    { mode: 'create' } | { mode: 'edit'; values: CategoryDialogValues } | null
  >(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
          <p className="text-sm text-gray-500">
            Organize suas transações por categorias
          </p>
        </div>
        <Button onClick={() => setDialogState({ mode: 'create' })}>
          <Plus className="size-4" /> Nova categoria
        </Button>
      </header>

      <section
        aria-label="Resumo de categorias"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Total de categorias"
          value={String(stats.totalCategories)}
          icon={<FolderOpen className="size-5" />}
        />
        <StatCard
          label="Total de transações"
          value={String(stats.totalTransactions)}
          icon={<Receipt className="size-5" />}
        />
        <StatCard
          label="Categoria mais usada"
          value={stats.mostUsed ?? '—'}
          icon={<Star className="size-5" />}
        />
      </section>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando categorias...</p>
      ) : categories.length === 0 ? (
        <EmptyState onCreate={() => setDialogState({ mode: 'create' })} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(category => (
            <li key={category.id}>
              <CategoryCard
                category={category as CategoryCardData}
                transactionCount={
                  transactionCountByCategory.get(category.id) ?? 0
                }
                onEdit={() =>
                  setDialogState({
                    mode: 'edit',
                    values: {
                      id: category.id,
                      name: category.name,
                      description: category.description,
                      icon: category.icon,
                      color: category.color,
                    },
                  })
                }
                onDelete={() =>
                  setDeleteTarget({ id: category.id, name: category.name })
                }
              />
            </li>
          ))}
        </ul>
      )}

      {dialogState ? (
        <CategoryDialog
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

      <CategoryDeleteConfirm
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null)
        }}
        category={deleteTarget}
      />
    </div>
  )
}

type StatCardProps = {
  label: string
  value: string
  icon: React.ReactNode
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-lg bg-brand-base/10 text-brand-base">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </span>
        <span className="text-lg font-semibold text-gray-800">{value}</span>
      </div>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-base/10 text-brand-base">
        <FolderOpen className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-gray-800">
          Nenhuma categoria ainda
        </h2>
        <p className="text-sm text-gray-500">
          Comece criando sua primeira categoria
        </p>
      </div>
      <Button onClick={onCreate}>
        <Plus className="size-4" /> Nova categoria
      </Button>
    </div>
  )
}
