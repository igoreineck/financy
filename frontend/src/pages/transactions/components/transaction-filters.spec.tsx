import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  ALL_CATEGORIES,
  type FilterableTransaction,
  type TransactionFilters as Filters,
  defaultFilters,
  useFilteredTransactions,
} from '../hooks/use-filtered-transactions'
import { TransactionFilters } from './transaction-filters'

beforeAll(() => {
  Element.prototype.hasPointerCapture = vi.fn(() => false) as never
  Element.prototype.releasePointerCapture = vi.fn() as never
  Element.prototype.scrollIntoView = vi.fn() as never
})

const categories = [
  { id: 'c1', name: 'Alimentação' },
  { id: 'c2', name: 'Salário' },
  { id: 'c3', name: 'Transporte' },
]

const transactions: FilterableTransaction[] = [
  {
    id: 't1',
    description: 'Mercado',
    type: 'EXPENSE',
    categoryId: 'c1',
    occurredAt: '2025-11-02T10:00:00Z',
  },
  {
    id: 't2',
    description: 'Salário mensal',
    type: 'INCOME',
    categoryId: 'c2',
    occurredAt: '2025-11-05T10:00:00Z',
  },
  {
    id: 't3',
    description: 'Uber para casa',
    type: 'EXPENSE',
    categoryId: 'c3',
    occurredAt: '2025-10-20T10:00:00Z',
  },
  {
    id: 't4',
    description: 'Mercado feira',
    type: 'EXPENSE',
    categoryId: 'c1',
    occurredAt: '2025-10-22T10:00:00Z',
  },
]

function Harness() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const { rows, total } = useFilteredTransactions(transactions, filters, 10)
  return (
    <div>
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />
      <div data-testid="total">{total}</div>
      <ul data-testid="results">
        {rows.map(row => (
          <li key={row.id}>{row.description}</li>
        ))}
      </ul>
    </div>
  )
}

describe('<TransactionFilters />', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2025-11-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('filters by description case-insensitively as a substring', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText('Search'), 'merc')

    expect(screen.getByTestId('total')).toHaveTextContent('2')
    const items = screen.getAllByRole('listitem').map(li => li.textContent)
    expect(items).toEqual(['Mercado', 'Mercado feira'])
  })

  it('filters by type', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('combobox', { name: 'Type' }))
    await user.click(await screen.findByRole('option', { name: 'Income' }))

    const items = screen.getAllByRole('listitem').map(li => li.textContent)
    expect(items).toEqual(['Salário mensal'])
  })

  it('filters by category and "All" disables the filter', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('combobox', { name: 'Category' }))
    await user.click(await screen.findByRole('option', { name: 'Transporte' }))

    let items = screen.getAllByRole('listitem').map(li => li.textContent)
    expect(items).toEqual(['Uber para casa'])

    await user.click(screen.getByRole('combobox', { name: 'Category' }))
    await user.click(await screen.findByRole('option', { name: 'All' }))

    items = screen.getAllByRole('listitem').map(li => li.textContent)
    expect(items).toHaveLength(4)
  })

  it('"This month" filters to current month; "Custom" filters a custom range', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('combobox', { name: 'Period' }))
    await user.click(await screen.findByRole('option', { name: 'This month' }))

    let items = screen.getAllByRole('listitem').map(li => li.textContent)
    expect(items).toEqual(['Mercado', 'Salário mensal'])

    await user.click(screen.getByRole('combobox', { name: 'Period' }))
    await user.click(await screen.findByRole('option', { name: 'Custom' }))

    await user.type(screen.getByLabelText('From'), '2025-10-21')
    await user.type(screen.getByLabelText('To'), '2025-11-02')

    items = screen.getAllByRole('listitem').map(li => li.textContent)
    expect(items).toEqual(['Mercado', 'Mercado feira'])
  })

  it('combines filters with AND', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByLabelText('Search'), 'mercado')
    await user.click(screen.getByRole('combobox', { name: 'Category' }))
    await user.click(await screen.findByRole('option', { name: 'Alimentação' }))
    await user.click(screen.getByRole('combobox', { name: 'Period' }))
    await user.click(await screen.findByRole('option', { name: 'This month' }))

    const items = screen.getAllByRole('listitem').map(li => li.textContent)
    expect(items).toEqual(['Mercado'])
  })
})

describe('ALL_CATEGORIES sentinel', () => {
  it('equals the value used for the default filter', () => {
    expect(defaultFilters.categoryId).toBe(ALL_CATEGORIES)
  })
})
