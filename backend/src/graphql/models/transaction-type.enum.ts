import { registerEnumType } from 'type-graphql'

import { TransactionType } from '@/app/transactions/transaction-type'

registerEnumType(TransactionType, { name: 'TransactionType' })

export { TransactionType }
