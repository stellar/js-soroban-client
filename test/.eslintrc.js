module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    mocha: true
  },
  globals: {
    AxiosClient: true,
    SorobanClient: true,
    axios: true,
    chai: true,
    expect: true,
    serverUrl: true,
    sinon: true
  },
  rules: {
    'no-unused-vars': 0
  }
};
