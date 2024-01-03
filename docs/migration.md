**This library is deprecated in favor of `@stellar/stellar-sdk`.**

## Migrating to `@stellar/stellar-sdk`

This migration guide is focused towards former users of `soroban-client`, but you can refer to the [full migration guide](https://gist.github.com/Shaptic/5ce4f16d9cce7118f391fbde398c2f30/) for more details.

### Why?

Many applications built on Stellar need to utilize both [Horizon](https://developers.stellar.org/docs/fundamentals-and-concepts/stellar-stack#horizon-api) (in order to support Stellar's existing, native functionality and do things like query transaction history, manage DEX offers, etc.) as well as [Soroban RPC](https://soroban.stellar.org/docs/reference/rpc) (in order to interact with smart contracts, retrieve event streams, etc.). By separating support for these two APIs across two SDKs, the applications have unnecessary bloat and code duplication. They both have a unified interface: the protocol XDR (which is abstracted by [`stellar-base`](https://www.npmjs.com/package/stellar-base)), and so it makes sense for a single package to have modules for communicating with either of the interfaces.

If you *just* need Soroban RPC (which is likely the case given that you're in this repository), you can continue to just use those pieces. The only adaptation necessary is updating module references.

### Module Philosophy

All of the abstractions related to Soroban RPC live under the `SorobanRpc` namespace, and the API definitions live under `SorobanRpc.Api`:

```js
// before:
import * as SorobanClient from 'soroban-client';

const s = SorobanClient.Server("...");
const r: SorobanClient.SorobanRpc.GetTransactionResponse = s.getTransaction("...");

// after:
import { SorobanRpc } from '@stellar/stellar-sdk';

const s = SorobanRpc.Server("...");
const r: SorobanRpc.Api.GetTransactionResponse = s.getTransaction("...");
```

All of the _shared_ interfaces, such as those for building operations, dealing with accounts, or touch the XDR in any way (i.e. the fundamental building blocks of the Stellar protocol) still live at the top level. For example,

```js
import {
    Account,
    TransactionBuilder,
    SorobanDataBuilder
} from '@stellar/stellar-sdk';
```

(If you've ever imported and used `stellar-base` directly, then this distinction should be clear: anything found in `stellar-base` lives in the top-level module.)

### Migration Details

To migrate, you will need to identify where you are interacting with the RPC server vs. just interacting with the Stellar protocol. Namely,

* `Server` now lives under the `SorobanRpc` submodule
* Soroban helpers such as `assembleTransaction` also live under this submodule
* The API definitions now live in the `SorobanRpc.Api` submodule
* Helpers that are "shared" and have nothing to do with the RPC (like `TransactionBuilder` and `ContractSpec`) are still in the top level

Here's an example before-and-after set of scripts:

Before:

```typescript
import * as SorobanClient from 'soroban-client';

const s = SorobanClient.Server('https://rpc-futurenet.stellar.org');
const kp = SorobanClient.Keypair.random();
const c = new Contract("C...");

async function main() {
    return s.getAccount(kp.publicKey()).then(account => {
        const tx = new SorobanClient.TransactionBuilder(account, {
            fee: BASE_FEE
        })
            .addOperation(c.call("hello", SorobanClient.scValToNative("world")))
            .setNetworkPassphrase(StellarSdk.Networks.FUTURENET)
            .setTimeout(30)
            .build();

        let sim: SorobanClient.SorobanRpc.SimulateTransactionResult;
        sim = await s.simulateTransaction(tx);
        const readyTx = SorobanClient.assembleTransaction(
            tx,
            StellarSdk.Networks.FUTURENET,
            sim);

        readyTx.sign(kp);
        return s.submitTransaction(readyTx);
    });
}
```

After:

```typescript
import {
    Keypair,
    Networks,
    TransactionBuilder,
    Operation,
    scValToNative,
    SorobanRpc
} from '@stellar/stellar-sdk';
const { Api, Server, assembleTransaction } = SorobanRpc;

const s = Server('https://soroban-testnet.stellar.org');
const kp = Keypair.random();

async function main() {
    return s.getAccount(kp.publicKey()).then(account => {
        const tx = new TransactionBuilder(account, { fee: BASE_FEE })
            .addOperation(c.call("hello", nativeToScVal("world")))
            .setNetworkPassphrase(Networks.TESTNET)
            .setTimeout(30)
            .build();

        let sim: Api.SimulateTransactionResult;
        sim = await s.simulateTransaction(tx);
        const readyTx = assembleTransaction(tx, sim);
        readyTx.sign(kp);

        return s.submitTransaction(readyTx);
    });
}
```
