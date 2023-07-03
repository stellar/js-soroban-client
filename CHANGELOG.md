# Changelog

- Forked from [stellar/js-stellar-sdk](https://github.com/stellar/js-stellar-sdk).

A breaking change should be clearly marked in this log.


## Unreleased

## v0.9.0

### Updated
* `Server.getContractData` has an additional, optional parameter: `expirationType?: string` which should be set to either `'temporary'` or `'persistent'` depending on the type of ledger key. By default, it will attempt to fetch both, returning whichever one it finds ([#103](https://github.com/stellar/js-soroban-client/pull/103)).
* The XDR library (`stellar-base`) has been upgraded to Preview 10's protocol format. This includes the following changes:

#### Breaking Changes

- Many XDR structures have changed, please refer to the `types/next.d.ts` diff for details ([#633](https://github.com/stellar/js-stellar-base/pull/633)).
- We have returned to the world in which **one** transaction contains **one** operation which contains **one** host function invocation. This means `Operation.invokeHostFunctions` is gone and `Operation.invokeHostFunction` has changed to accept `{ func, auth }`, where `func` is the correct `xdr.HostFunction` and `auth` is a list of `xdr.SorobanAuthorizationEntry` items that outline the authorization tree for the call stack ([#633](https://github.com/stellar/js-stellar-base/pull/633)). Better abstractions for creating an `xdr.HostFunction` are forthcoming, though you can still refer to `Contract.call()` for help.

#### Added

- A new abstraction for dealing with large integers and `ScVal`s: see `ScInt`, `XdrLargeInt`, and `scValToBigInt` ([#620](https://github.com/stellar/js-stellar-base/pull/620)).
- A new abstraction for converting between native JavaScript types and complex `ScVal`s: see `nativeToScVal` and `scValToNative` ([#630](https://github.com/stellar/js-stellar-base/pull/630)).
- We have added two new operations related to state expiration in Soroban: `BumpFootprintExpiration` and `RestoreFootprint`. Please refer to their docstrings for details ([#633](https://github.com/stellar/js-stellar-base/pull/633)).



## v0.8.1

### Fix

* The `stellar-base` library is pinned to a specific version so that a fresh installation (via e.g. `npm i soroban-client`) does not pull the latest major version (without Soroban support) ([#100](https://github.com/stellar/js-soroban-client/pull/100)).


## v0.8.0

### Added

* `Server.getContractId()` now accepts a contract strkey ([#97](https://github.com/stellar/js-soroban-client/pull/97)).

### Updated

* The XDR library (`stellar-base`) has been upgraded to handle contract strkeys (`C...` addresses) better (see [#612](https://github.com/stellar/js-stellar-base/pull/612) and [#614](https://github.com/stellar/js-stellar-base/pull/614) of [`stellar-base`](https://github.com/stellar/js-stellar-base)) ([#98](https://github.com/stellar/js-soroban-client/pull/98)).

* Misc. dependencies have been upgraded and the `buffer` polyfill is now a primary dependency ([#98](https://github.com/stellar/js-soroban-client/pull/98)).


## v0.7.2

### Fixed
* Downstream dependencies are transpiled to target the same older JS environments as the main library ([#96](https://github.com/stellar/js-soroban-client/pull/96)).


## v0.7.1

### Fixed
* The module was not being exported correctly in browser environments; the following should now work in your project ([#95](https://github.com/stellar/js-soroban-client/pull/95)):

```ts
import * as SorobanClient from 'soroban-client';
```

* The browser bundles compatibility has increased, supporting older JS environments and undoing [#90](https://github.com/stellar/js-soroban-client/pull/90) from v0.7.0 ([#95](https://github.com/stellar/js-soroban-client/pull/95)).


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
