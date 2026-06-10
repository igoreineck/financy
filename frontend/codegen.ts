import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../backend/schema.graphql',
  documents: ['src/**/*.graphql', 'src/**/*.tsx', 'src/**/*.ts'],
  ignoreNoDocuments: true,
  generates: {
    'src/gql/': {
      preset: 'client',
    },
  },
}

export default config
