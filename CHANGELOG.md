# Changelog

- Forked from [stellar/js-stellar-sdk](https://github.com/stellar/js-stellar-sdk).

A breaking change should be clearly marked in this log.


## Unreleased


## v0.10.1

### Fixed
* The `stellar-base` dependency has been upgraded to fix a TypeScript bug ([#665](https://github.com/stellar/js-stellar-base/pull/665)).
* Decreased bundle size by refactoring `assembleTransaction` to use new abstractions from `stellar-base` ([#120](https://github.com/stellar/js-soroban-client/pull/120)).


## v0.10.0

### Breaking Changes
* We have dropped all support for the deprecated hex-encoded contract ID format ([#117](https://github.com/stellar/js-soroban-client/pull/117), [#658](https://github.com/stellar/js-stellar-base/pull/658)).

You should use the well-supported `C...` strkey format, instead. To migrate, you can do something like

```js
let contractId = StrKey.encodeContract(Buffer.from(hexContractId, 'hex'));
```

### Added
* Updated `stellar-base` dependency to [v10.0.0-soroban.5](https://www.npmjs.com/package/stellar-base/v/10.0.0-soroban.5) which introduces many helpful Soroban abstractions (see [full release notes](https://github.com/stellar/js-stellar-base/pull/661)):
  - Use an existing, immutable `Transaction` as a template for a new one via `TransactionBuilder.cloneFrom(tx, opts = {})` and use `opts` to override fields ([#656](https://github.com/stellar/js-stellar-base/pull/656)).
  - Use the new `SorobanDataBuilder` class to easily prepare Soroban transaction footprints [#660](https://github.com/stellar/js-stellar-base/pull/660).
  - Use `humanizeEvents` to create human-readable versions of `xdr.ContractEvent`s and `xdr.DiagnosticEvent`s that come out of transaction meta ([#659](https://github.com/stellar/js-stellar-base/pull/659)).
  - Use several helpers to reliably build Soroban authorization entries for complex, multi-party signing scenarios ([#663](https://github.com/stellar/js-stellar-base/pull/663)). These are each at various levels of granularity/complexity:
    * `authorizeInvocation`
    * `authorizeInvocationCallback`
    * `buildAuthEnvelope`
    * `buildAuthEntry`

### Fixed
* `assembleTransaction()` (and `Server.prepareTransaction()` by proxy) will now override the authorization portion of simulation if you provide a transaction with existing authorization entries. This is because, in complex auth scenarios, you may have signed entries that would be overwritten by simulation, so this just uses your existing entries ([#114](https://github.com/stellar/js-soroban-client/pull/114)).
* Added a missing `type` field to the `EventResponse` interface ([#118](https://github.com/stellar/js-soroban-client/pull/118)).


## v0.9.2

### Updated
* Updated `stellar-base` dependency to fix the way `scValToNative` converts string and symbol values: they will always decode strings when possible ([#112](https://github.com/stellar/js-soroban-client/pull/112) for [#645](https://github.com/stellar/js-stellar-base/pull/645)).


## v0.9.1

### Updated
* Updated `stellar-base` dependency to fix an issue when building & invoking contract transactions.

## v0.9.0

### Updated
* `Server.getContractData` has an additional, optional parameter: `expirationType?: string` which should be set to either `'temporary'` or `'persistent'` depending on the type of ledger key. By default, it will attempt to fetch both, returning whichever one it finds ([#103](https://github.com/stellar/js-soroban-client/pull/103)).
* `assembleTransaction` now accepts simulation results for the new `BumpFootprintExpirationOp`s and `RestoreFootprintOp`s ([#108](https://github.com/stellar/js-soroban-client/pull/108)).
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
