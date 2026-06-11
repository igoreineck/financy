import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import {
  ALL_CATEGORIES,
  type TransactionFilters as Filters,
  type PeriodFilter,
} from '../hooks/use-filtered-transactions'

type CategoryOption = { id: string; name: string }

type TransactionFiltersProps = {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  categories: CategoryOption[]
}

const periodOptions = [
  { value: 'this-month' as const, label: 'Este mês' },
  { value: 'last-month' as const, label: 'Mês passado' },
  { value: 'all' as const, label: 'Todo o período' },
  { value: 'custom' as const, label: 'Personalizado' },
]

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function periodTriggerLabel(kind: PeriodFilter['kind']) {
  if (kind === 'all') return 'Todo o período'
  if (kind === 'custom') return 'Personalizado'
  const now = new Date()
  const ref =
    kind === 'last-month'
      ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
      : now
  return `${capitalize(monthFormatter.format(ref))} / ${ref.getFullYear()}`
}

export function TransactionFilters({
  filters,
  onFiltersChange,
  categories,
}: TransactionFiltersProps) {
  function update(patch: Partial<Filters>) {
    onFiltersChange({ ...filters, ...patch })
  }

  function setPeriodKind(kind: PeriodFilter['kind']) {
    if (kind === 'custom') {
      update({ period: { kind: 'custom', from: '', to: '' } })
    } else {
      update({ period: { kind } })
    }
  }

  function setCustomFrom(from: string) {
    if (filters.period.kind !== 'custom') return
    update({ period: { ...filters.period, from } })
  }

  function setCustomTo(to: string) {
    if (filters.period.kind !== 'custom') return
    update({ period: { ...filters.period, to } })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-search">Buscar</Label>
          <Input
            id="filter-search"
            icon={<Search />}
            placeholder="Buscar por descrição"
            value={filters.search}
            onChange={event => update({ search: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-type">Tipo</Label>
          <Select
            value={filters.type}
            onValueChange={value => update({ type: value as Filters['type'] })}
          >
            <SelectTrigger id="filter-type" aria-label="Tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="INCOME">Receita</SelectItem>
              <SelectItem value="EXPENSE">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-category">Categoria</Label>
          <Select
            value={filters.categoryId}
            onValueChange={value => update({ categoryId: value })}
          >
            <SelectTrigger id="filter-category" aria-label="Categoria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>Todas</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-period">Período</Label>
          <Select
            value={filters.period.kind}
            onValueChange={value =>
              setPeriodKind(value as PeriodFilter['kind'])
            }
          >
            <SelectTrigger id="filter-period" aria-label="Período">
              <SelectValue>
                {periodTriggerLabel(filters.period.kind)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filters.period.kind === 'custom' ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-from">De</Label>
            <Input
              id="filter-from"
              type="date"
              value={filters.period.from ?? ''}
              onChange={event => setCustomFrom(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-to">Até</Label>
            <Input
              id="filter-to"
              type="date"
              value={filters.period.to ?? ''}
              onChange={event => setCustomTo(event.target.value)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
