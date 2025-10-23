module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Usa Prettier como configuración base
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ingnorePatterns: ['.eslintrc.js'],
  rules: {
    'prettier/prettier': ['error', { semi: true }], // Enfatiza el uso de ;
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  "prettier/prettier": [
    "error",
    {
      "endOfLine": "auto"
    }
  ]
};
