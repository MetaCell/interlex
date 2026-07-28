module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  // `nervosensus` is a separate project checked out inside this tree for reference while the Cell
  // Card's deep-link widgets are built (git-ignored). Linting it under this config reports ~1900
  // errors that are not this project's to fix, and `yarn lint` fails before reaching src/.
  ignorePatterns: ['dist', '.eslintrc.cjs', 'nervosensus'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  overrides: [
    {
      files: ['test/**/*.js'],
      env: { jest: true, node: true, commonjs: true },
    },
  ],
}
