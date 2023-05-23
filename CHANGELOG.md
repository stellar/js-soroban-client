# Changelog

- Forked from js-stellar-sdk

A breaking change should be clearly marked in this log.

#### 0.6.1
* removed reference to deprecated usage of gulp in docs build step [#80](https://github.com/stellar/js-soroban-client/pull/80)

#### 0.6.0
* updated server.prepareTransaction() for new soroban simulation results and fees. Note the change in behavior now, where transaction fee will be increased by the resource fee estimates received from simulation. More details this aspect mentioned on method.[#76](https://github.com/stellar/js-soroban-client/issues/76)

* SDK Modernization, refresh the build system to use the latest in JS build pipelines.[#69](https://github.com/stellar/js-soroban-client/pull/69)


#### 0.5.1

* remove params from jsonrpc post payload if empty. [#70](https://github.com/stellar/js-soroban-client/pull/70)

* add server method for rpc getLatestLedger endpoint. [#67](https://github.com/stellar/js-soroban-client/pull/67)

* remove phantomjs from dev dependencies. [#68](https://github.com/stellar/js-soroban-client/pull/68)



