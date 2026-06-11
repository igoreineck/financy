import { Button } from '@/components/ui/button'
import { ListCategoriesDocument, ListTransactionsDocument } from '@/gql/graphql'
import { TransactionDialog } from '@/pages/transactions/components/transaction-dialog'
import { useQuery } from '@apollo/client/react'
import { ArrowDown, ArrowUp, Plus, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { CategorySummary } from './components/category-summary'
import {
  type RecentTransaction,
  RecentTransactions,
} from './components/recent-transactions'
import { StatCard } from './components/stat-card'
import { useCategoryAggregates } from './hooks/use-category-aggregates'
import { useMonthlySummary } from './hooks/use-monthly-summary'

export function DashboardPage() {
  const { data: transactionsData, loading } = useQuery(ListTransactionsDocument)
  const { data: categoriesData } = useQuery(ListCategoriesDocument)

  const transactions = transactionsData?.listTransactions ?? []
  const categories = categoriesData?.listCategories ?? []

  const summary = useMonthlySummary(transactions)
  const aggregates = useCategoryAggregates(transactions, categories)

  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <section
        aria-label="Resumo do mês"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <StatCard
          label="Saldo total"
          valueCents={summary.saldo}
          icon={Wallet}
          variant="neutral"
        />
        <StatCard
          label="Receitas do mês"
          valueCents={summary.receitas}
          icon={ArrowUp}
          variant="positive"
        />
        <StatCard
          label="Despesas do mês"
          valueCents={summary.despesas}
          icon={ArrowDown}
          variant="negative"
        />
      </section>

      {loading ? (
        <p className="text-sm text-gray-500">Carregando dashboard...</p>
      ) : transactions.length === 0 ? (
        <EmptyState onCreate={() => setDialogOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentTransactions
              transactions={transactions as RecentTransaction[]}
              onCreate={() => setDialogOpen(true)}
            />
          </div>
          <CategorySummary aggregates={aggregates} />
        </div>
      )}

      {dialogOpen ? (
        <TransactionDialog open onOpenChange={setDialogOpen} mode="create" />
      ) : null}
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
          Comece criando sua primeira transação
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onCreate}>
          <Plus className="size-4" /> Nova transação
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/transacoes">Ver transações</Link>
        </Button>
      </div>
    </div>
  )
}
