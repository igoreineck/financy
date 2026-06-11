import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreateTransactionDocument,
  ListCategoriesDocument,
  ListTransactionsDocument,
  UpdateTransactionDocument,
} from '@/gql/graphql'
import { toIsoDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client/react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().trim().min(1, 'Descrição obrigatória'),
  amount: z.number().int().positive('Valor deve ser maior que zero'),
  occurredAt: z.string().min(1, 'Data obrigatória'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
})

type TransactionForm = {
  type: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  occurredAt: string
  categoryId: string
}

export type TransactionDialogValues = {
  id?: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  occurredAt: string
  categoryId: string
}

type TransactionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  initialValues?: TransactionDialogValues
}

export function TransactionDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
}: TransactionDialogProps) {
  const { data: categoriesData } = useQuery(ListCategoriesDocument)
  const categories = categoriesData?.listCategories ?? []

  const [createTransaction, { loading: creating }] = useMutation(
    CreateTransactionDocument,
    { refetchQueries: [{ query: ListTransactionsDocument }] },
  )
  const [updateTransaction, { loading: updating }] = useMutation(
    UpdateTransactionDocument,
    { refetchQueries: [{ query: ListTransactionsDocument }] },
  )
  const loading = creating || updating

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<TransactionForm>({
    defaultValues: buildDefaults(initialValues),
  })

  const currentType = watch('type')

  const onSubmit = handleSubmit(async raw => {
    const parsed = transactionSchema.safeParse({
      ...raw,
      amount: Number(raw.amount),
    })
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof TransactionForm | undefined
        if (field) setError(field, { message: issue.message })
      }
      return
    }

    const data = {
      description: parsed.data.description,
      amount: parsed.data.amount,
      type: parsed.data.type,
      categoryId: parsed.data.categoryId,
      occurredAt: new Date(`${parsed.data.occurredAt}T00:00:00Z`).toISOString(),
    }

    try {
      if (mode === 'create') {
        await createTransaction({ variables: { data } })
        toast.success('Transação criada')
      } else if (initialValues?.id) {
        await updateTransaction({
          variables: { id: initialValues.id, data },
        })
        toast.success('Transação atualizada')
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
          <DialogTitle
            className={cn(
              currentType === 'INCOME' ? 'text-success' : 'text-danger',
            )}
          >
            {mode === 'create' ? 'Nova transação' : 'Editar transação'}
          </DialogTitle>
          <DialogDescription>Registre suas entradas e saídas</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div
                aria-label="Tipo da transação"
                className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1"
              >
                <TypeToggleButton
                  active={field.value === 'EXPENSE'}
                  tone="danger"
                  onClick={() => field.onChange('EXPENSE')}
                >
                  Despesa
                </TypeToggleButton>
                <TypeToggleButton
                  active={field.value === 'INCOME'}
                  tone="success"
                  onClick={() => field.onChange('INCOME')}
                >
                  Receita
                </TypeToggleButton>
              </div>
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="description"
              state={errors.description ? 'error' : 'default'}
            >
              Descrição
            </Label>
            <Input
              id="description"
              placeholder="Ex. Mercado"
              error={Boolean(errors.description)}
              {...register('description')}
            />
            {errors.description ? (
              <span className="text-xs text-danger">
                {errors.description.message}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount" state={errors.amount ? 'error' : 'default'}>
              Valor
            </Label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput
                  id="amount"
                  value={Number(field.value) || 0}
                  onChange={field.onChange}
                  error={Boolean(errors.amount)}
                />
              )}
            />
            {errors.amount ? (
              <span className="text-xs text-danger">
                {errors.amount.message}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="occurredAt"
              state={errors.occurredAt ? 'error' : 'default'}
            >
              Data
            </Label>
            <Input
              id="occurredAt"
              type="date"
              error={Boolean(errors.occurredAt)}
              {...register('occurredAt')}
            />
            {errors.occurredAt ? (
              <span className="text-xs text-danger">
                {errors.occurredAt.message}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="categoryId"
              state={errors.categoryId ? 'error' : 'default'}
            >
              Categoria
            </Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => {
                const selected = categories.find(c => c.id === field.value)
                return (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="categoryId"
                      aria-label="Categoria"
                      error={Boolean(errors.categoryId)}
                    >
                      <SelectValue placeholder="Selecione">
                        {selected?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              }}
            />
            {errors.categoryId ? (
              <span className="text-xs text-danger">
                {errors.categoryId.message}
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

type TypeToggleButtonProps = {
  active: boolean
  tone: 'success' | 'danger'
  onClick: () => void
  children: React.ReactNode
}

function TypeToggleButton({
  active,
  tone,
  onClick,
  children,
}: TypeToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-10 items-center justify-center rounded-md text-sm font-medium transition-colors',
        active
          ? tone === 'success'
            ? 'bg-white text-success shadow-sm'
            : 'bg-white text-danger shadow-sm'
          : 'text-gray-500 hover:text-gray-700',
      )}
    >
      {children}
    </button>
  )
}

function buildDefaults(initial?: TransactionDialogValues): TransactionForm {
  return {
    type: initial?.type ?? 'EXPENSE',
    description: initial?.description ?? '',
    amount: initial?.amount ?? 0,
    occurredAt: initial?.occurredAt
      ? toIsoDate(new Date(initial.occurredAt))
      : '',
    categoryId: initial?.categoryId ?? '',
  }
}
