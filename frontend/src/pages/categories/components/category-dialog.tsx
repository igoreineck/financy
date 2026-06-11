import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TagColor } from '@/components/ui/tag'
import {
  CreateCategoryDocument,
  ListCategoriesDocument,
  UpdateCategoryDocument,
} from '@/gql/graphql'
import { useMutation } from '@apollo/client/react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { isCategoryColor } from '../color-map'
import { type CategoryIconName, isCategoryIcon } from '../icon-map'
import { ColorPicker } from './color-picker'
import { IconPicker } from './icon-picker'

const categorySchema = z.object({
  name: z.string().trim().min(1, 'Título obrigatório'),
  description: z.string().trim().optional(),
  icon: z.string().refine(isCategoryIcon, 'Selecione um ícone'),
  color: z.string().refine(isCategoryColor, 'Selecione uma cor'),
})

type CategoryForm = {
  name: string
  description: string
  icon: CategoryIconName | ''
  color: TagColor | ''
}

export type CategoryDialogValues = {
  id?: string
  name: string
  description?: string | null
  icon: string
  color: string
}

type CategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialValues?: CategoryDialogValues
}

export function CategoryDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
}: CategoryDialogProps) {
  const [createCategory, { loading: creating }] = useMutation(
    CreateCategoryDocument,
    { refetchQueries: [{ query: ListCategoriesDocument }] },
  )
  const [updateCategory, { loading: updating }] = useMutation(
    UpdateCategoryDocument,
    { refetchQueries: [{ query: ListCategoriesDocument }] },
  )
  const loading = creating || updating

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryForm>({
    defaultValues: buildDefaults(initialValues),
  })

  const onSubmit = handleSubmit(async raw => {
    const parsed = categorySchema.safeParse(raw)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        setError(issue.path[0] as keyof CategoryForm, {
          message: issue.message,
        })
      }
      return
    }

    const data = {
      name: parsed.data.name,
      description: parsed.data.description?.length
        ? parsed.data.description
        : null,
      icon: parsed.data.icon,
      color: parsed.data.color,
    }

    try {
      if (mode === 'create') {
        await createCategory({ variables: { data } })
        toast.success('Categoria criada')
      } else if (initialValues?.id) {
        await updateCategory({
          variables: { id: initialValues.id, data },
        })
        toast.success('Categoria atualizada')
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  })

  function handleOpenChange(next: boolean) {
    if (!next) {
      reset(buildDefaults(initialValues))
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova categoria' : 'Editar categoria'}
          </DialogTitle>
          <DialogDescription>
            Organize suas transações com categorias
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" state={errors.name ? 'error' : 'default'}>
              Título
            </Label>
            <Input
              id="name"
              placeholder="Ex. Alimentação"
              error={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name ? (
              <span className="text-xs text-danger">{errors.name.message}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Descrição da categoria"
              {...register('description')}
            />
            <span className="text-xs text-gray-500">Opcional</span>
          </div>

          <div className="flex flex-col gap-3">
            <Label state={errors.icon ? 'error' : 'default'}>Ícone</Label>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <IconPicker
                  value={field.value === '' ? null : field.value}
                  onChange={field.onChange}
                  aria-invalid={Boolean(errors.icon)}
                />
              )}
            />
            {errors.icon ? (
              <span className="text-xs text-danger">{errors.icon.message}</span>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <Label state={errors.color ? 'error' : 'default'}>Cor</Label>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorPicker
                  value={field.value === '' ? null : field.value}
                  onChange={field.onChange}
                  aria-invalid={Boolean(errors.color)}
                />
              )}
            />
            {errors.color ? (
              <span className="text-xs text-danger">
                {errors.color.message}
              </span>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function buildDefaults(initial?: CategoryDialogValues): CategoryForm {
  return {
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    icon: initial && isCategoryIcon(initial.icon) ? initial.icon : '',
    color: initial && isCategoryColor(initial.color) ? initial.color : '',
  }
}
