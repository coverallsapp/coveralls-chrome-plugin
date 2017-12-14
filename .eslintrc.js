module.exports = {
  'extends': 'airbnb-base',
  rules: {
    'arrow-parens': ['error', 'always'],
    'no-param-reassign': 'off',
    'class-methods-use-this': 'off',
    'no-new': 'off',
    'no-underscore-dangle': 'off',
  },
  env: {
    browser: 'true'
  },
  globals: {
    chrome: true,
  }
};