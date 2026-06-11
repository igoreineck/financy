import { z } from 'zod'

const envSchema = z.object({
  VITE_BACKEND_URL: z.string().url().default('http://localhost:4000/graphql'),
})

export const env = envSchema.parse(import.meta.env)
