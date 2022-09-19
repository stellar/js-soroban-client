module.exports = {
  env: {
    mocha: true
  },
  globals: {
    AxiosClient: true,
    SorobanSdk: true,
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
