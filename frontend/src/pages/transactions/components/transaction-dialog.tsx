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
import { CircleArrowDown, CircleArrowUp } from 'lucide-react'
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
    formState: { errors },
  } = useForm<TransactionForm>({
    defaultValues: buildDefaults(initialValues),
  })

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
          <DialogTitle>
            {mode === 'create' ? 'Nova transação' : 'Editar transação'}
          </DialogTitle>
          <DialogDescription>Registre sua despesa ou receita</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div
                aria-label="Tipo da transação"
                className="grid grid-cols-2 gap-3"
              >
                <TypeToggleButton
                  active={field.value === 'EXPENSE'}
                  tone="danger"
                  icon={<CircleArrowDown className="size-5" />}
                  onClick={() => field.onChange('EXPENSE')}
                >
                  Despesa
                </TypeToggleButton>
                <TypeToggleButton
                  active={field.value === 'INCOME'}
                  tone="success"
                  icon={<CircleArrowUp className="size-5" />}
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
              placeholder="Ex. Almoço no restaurante"
              error={Boolean(errors.description)}
              {...register('description')}
            />
            {errors.description ? (
              <span className="text-xs text-danger">
                {errors.description.message}
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                htmlFor="amount"
                state={errors.amount ? 'error' : 'default'}
              >
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
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode
}

function TypeToggleButton({
  active,
  tone,
  icon,
  onClick,
  children,
}: TypeToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-12 items-center justify-center gap-2 rounded-lg border bg-white text-sm font-medium transition-colors',
        active
          ? tone === 'success'
            ? 'border-success text-success'
            : 'border-danger text-danger'
          : 'border-gray-300 text-gray-500 hover:text-gray-700',
      )}
    >
      <span aria-hidden="true">{icon}</span>
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
