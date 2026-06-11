import { Button } from '@/components/ui/button'
import type { TagColor } from '@/components/ui/tag'
import {
  ListCategoriesDocument,
  ListTransactionsForStatsDocument,
} from '@/gql/graphql'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client/react'
import { ArrowDownUp, FolderOpen, Plus, Tag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { isCategoryColor, textClassFor } from './color-map'
import { CategoryCard, type CategoryCardData } from './components/category-card'
import { CategoryDeleteConfirm } from './components/category-delete-confirm'
import {
  CategoryDialog,
  type CategoryDialogValues,
} from './components/category-dialog'
import { useCategoryStats } from './hooks/use-category-stats'
import { iconMap, isCategoryIcon } from './icon-map'

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

  const mostUsedIcon =
    stats.mostUsed && isCategoryIcon(stats.mostUsed.icon)
      ? iconMap[stats.mostUsed.icon]
      : null
  const mostUsedColor: TagColor =
    stats.mostUsed && isCategoryColor(stats.mostUsed.color)
      ? stats.mostUsed.color
      : 'gray'

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-800">Categorias</h1>
          <p className="text-sm text-gray-500">
            Organize suas transações por categorias
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogState({ mode: 'create' })}>
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
          icon={<Tag className="size-6" />}
          iconClassName="text-gray-800"
        />
        <StatCard
          label="Total de transações"
          value={String(stats.totalTransactions)}
          icon={<ArrowDownUp className="size-6" />}
          iconClassName="text-purple-base"
        />
        <StatCard
          label="Categoria mais utilizada"
          value={stats.mostUsed?.name ?? '—'}
          icon={
            mostUsedIcon ? (
              (() => {
                const Icon = mostUsedIcon
                return <Icon className="size-6" />
              })()
            ) : (
              <FolderOpen className="size-6" />
            )
          }
          iconClassName={
            stats.mostUsed ? textClassFor(mostUsedColor) : 'text-gray-500'
          }
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
  iconClassName: string
}

function StatCard({ label, value, icon, iconClassName }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className={cn('shrink-0', iconClassName)}>{icon}</span>
        <span className="text-3xl font-semibold text-gray-800">{value}</span>
      </div>
      <span className="pl-9 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
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
