import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DeleteCategoryDocument } from '@/gql/graphql'
import type { Reference } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { toast } from 'sonner'

type CategoryDeleteConfirmProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: { id: string; name: string } | null
}

export function CategoryDeleteConfirm({
  open,
  onOpenChange,
  category,
}: CategoryDeleteConfirmProps) {
  const [deleteCategory, { loading }] = useMutation(DeleteCategoryDocument, {
    update(cache, { data }) {
      if (!data?.deleteCategory || !category) return
      const removedRef = cache.identify({
        __typename: 'CategoryModel',
        id: category.id,
      })
      cache.modify({
        fields: {
          listCategories(existing: Reference[], { readField }) {
            return existing.filter(ref => readField('id', ref) !== category.id)
          },
        },
      })
      if (removedRef) cache.evict({ id: removedRef })
      cache.gc()
    },
  })

  async function handleConfirm() {
    if (!category) return
    try {
      await deleteCategory({ variables: { id: category.id } })
      toast.success('Categoria excluída')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir categoria?</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita.
            {category ? ` "${category.name}" será removida.` : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-danger hover:bg-danger/90"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
