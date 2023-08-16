module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    node: true
  },
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  rules: {
    'node/no-unpublished-require': 0
  }
};
