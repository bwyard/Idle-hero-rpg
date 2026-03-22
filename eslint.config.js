// eslint.config.js — AUTO-GENERATED. DO NOT EDIT directly.
// Re-sync: node claude-resources/tools/sync-thesis-eslint.js (from development/)
//
// Rules: const-only (no var/let), no classes — pure functions + readonly types.
import tsParser from '@typescript-eslint/parser'

const COMMON_RULES = {
  'prefer-const': 'error',
  'no-var': 'error',
  'no-restricted-syntax': [
    'error',
    {
      selector: 'ClassDeclaration',
      message: 'Use pure functions and readonly types instead of classes.',
    },
    {
      selector: 'ClassExpression',
      message: 'Use pure functions and readonly types instead of classes.',
    },
  ],
}

export default [
  // Global ignores — standalone entry (no files key) applies to all configs below.
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.d.ts',
      'scripts/**',
      'mcp-servers/**',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
    rules: COMMON_RULES,
  },
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: COMMON_RULES,
  },
]
