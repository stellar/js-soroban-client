# Changelog

- Forked from [stellar/js-stellar-sdk](https://github.com/stellar/js-stellar-sdk).

A breaking change should be clearly marked in this log.


## Unreleased


## v0.7.0

### Breaking
* Replaced the deprecated `getLedgerEntry` with `getLedgerEntries` ([#66](https://github.com/stellar/js-soroban-client/pull/66)).

### Fixed
* Transaction simulation parses correctly when there is no auth ([#89](https://github.com/stellar/js-soroban-client/pull/89)).
* TypeScript types are packaged correctly ([#86](https://github.com/stellar/js-soroban-client/pull/86)).
* Documentation is packaged correctly ([#87](https://github.com/stellar/js-soroban-client/pull/87), [#88](https://github.com/stellar/js-soroban-client/pull/88)).

### Updated
* Published bundles support modern JS features (ES6ish) ([#90](https://github.com/stellar/js-soroban-client/pull/90)).


## v0.6.1

This version was tagged solely to trigger a documentation build.

### Fixed
* Removed extraneous reference to `gulp` in docs building step ([#80](https://github.com/stellar/js-soroban-client/pull/80)).


## v0.6.0

### Breaking

* Updated `Server.prepareTransaction()` for new Soroban simulation results and fees. Note the change in behavior now, where transaction fee will be increased by the resource fee estimates received from simulation ([#76](https://github.com/stellar/js-soroban-client/issues/76)).

### Updated

* SDK Modernization, refreshing the build system to use the latest in JS build pipelines ([#69](https://github.com/stellar/js-soroban-client/pull/69)).


## v0.5.1

* remove params from jsonrpc post payload if empty. [#70](https://github.com/stellar/js-soroban-client/pull/70)

* add server method for rpc getLatestLedger endpoint. [#67](https://github.com/stellar/js-soroban-client/pull/67)

* remove phantomjs from dev dependencies. [#68](https://github.com/stellar/js-soroban-client/pull/68)
