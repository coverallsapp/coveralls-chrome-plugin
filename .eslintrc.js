module.exports = {
  'extends': [
    'airbnb-base',
    'plugin:flowtype/recommended',
  ],
  parser: 'babel-eslint',
  plugins:[
    'flowtype',
  ],
  rules: {
    'arrow-parens': ['error', 'always'],
    'no-param-reassign': 'off',
    'class-methods-use-this': 'off',
    'no-new': 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
  },
  env: {
    browser: 'true'
  },
  globals: {
    chrome: true,
  }
};
