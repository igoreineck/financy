import { IconButton } from '@/components/ui/icon-button'
import { Tag } from '@/components/ui/tag'
import type { TagColor } from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'
import { iconBgClassFor, isCategoryColor } from '../color-map'
import { iconMap, isCategoryIcon } from '../icon-map'

export type CategoryCardData = {
  id: string
  name: string
  description?: string | null
  icon: string
  color: string
}

type CategoryCardProps = {
  category: CategoryCardData
  transactionCount: number
  onEdit: () => void
  onDelete: () => void
}

export function CategoryCard({
  category,
  transactionCount,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const Icon = isCategoryIcon(category.icon) ? iconMap[category.icon] : null
  const color: TagColor = isCategoryColor(category.color)
    ? category.color
    : 'gray'

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-lg',
            iconBgClassFor(color),
          )}
        >
          {Icon ? <Icon className="size-6" aria-hidden="true" /> : null}
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            variant="danger"
            aria-label={`Excluir ${category.name}`}
            onClick={onDelete}
          >
            <Trash2 />
          </IconButton>
          <IconButton aria-label={`Editar ${category.name}`} onClick={onEdit}>
            <Pencil />
          </IconButton>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-gray-800">
          {category.name}
        </h3>
        {category.description ? (
          <p className="text-sm text-gray-500">{category.description}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Tag color={color}>{category.name}</Tag>
        <span className="text-xs font-medium text-gray-500">
          {transactionCount} {transactionCount === 1 ? 'item' : 'itens'}
        </span>
      </div>
    </article>
  )
}
