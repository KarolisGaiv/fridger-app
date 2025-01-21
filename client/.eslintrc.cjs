/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': 'warn',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              'app',
              'config',
              'database',
              'entities',
              'modules',
              'repositories',
              'trpc',
              'utils',
            ].flatMap((path) => [`@server/${path}`, `@mono/server/src/${path}`]),
            message: 'Please only import from @server/shared or @mono/server/src/shared.',
          },
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
