---
title: Overview
---
The JavaScript Soroban Client facilitates integration with the [Stellar Soroban-RPC API server](https://github.com/stellar/soroban-tools/tree/master/cmd/soroban-rpc) and submission of Stellar transactions, either on Node.js or in the browser. It has two main uses: [querying Soroban-RPC](#querying-soroban-rpc) and [building, signing, and submitting transactions to the Stellar network](#building-transactions).

[Building and installing js-soroban-client](https://github.com/stellar/js-soroban-client)<br>
[Examples of using js-soroban-client](./examples.md)

# Querying Soroban-RPC
js-soroban-client gives you access to all the endpoints exposed by Soroban-RPC.

## Building requests

Starting with a [server](https://stellar.github.io/js-soroban-client/Server.html) object, you can call methods to query the server.
(See the [Soroban-RPC reference](https://soroban.stellar.org/api/) documentation for what methods are possible.)
```js
var SorobanClient = require('soroban-client');
var server = new SorobanClient.Server('http://localhost:8000/soroban/rpc');

// get the sequence number for an account
server.getAccount(
  'GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW'
).then(function(r){ console.log(r); });
```

Methods return a [promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) of the response from the Soroban-RPC server. If there is an error, the promise will throw an error.

## Handling responses

### XDR
The transaction endpoints will return some fields in raw [XDR](https://developers.stellar.org/api/introduction/xdr/)
form. You can convert this XDR to JSON using the `.fromXDR()` method.

An example of using the `getLedgerEntry` method to read the current ledger entry for an account and print the XDR field as JSON:

```javascript
// Construct the LedgerKey we want to look up
const key = SorobanClient.xdr.LedgerKey.account(
  new SorobanClient.xdr.LedgerKeyAccount({
    accountId: 'GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW'
  })
);

// Fetch the current LedgerKeyData from the server.
server.getLedgerEntry(key).then(function (response) {
  const parsed = SorobanClient.xdr.LedgerEntryData.fromXDR(response.xdr, 'base64');
  console.log( JSON.stringify(parsed) );
});
```

# Transactions

## Building transactions

See the [Building Transactions](https://github.com/stellar/js-stellar-base/blob/master/docs/reference/building-transactions.md) guide for information about assembling a transaction.

## Submitting transactions
Once you have built your transaction, you can send it to the Stellar network with `Server.sendTransaction()`.
```js
const SorobanClient = require('soroban-client')
const server = new SorobanClient.Server('http://localhost:8000/soroban/rpc');

(async function main() {
    const account = await server.getAccount(publicKey);

    // Fee hardcoded for this example.
    const fee = 100;

    const contract = new SorobanClient.Contract(contractId);

    const transaction = new SorobanClient.TransactionBuilder(account, { fee, networkPassphrase: SorobanClient.Networks.STANDALONE })
        .addOperation(
            // An operation to call increment on the contract
            contract.call("increment")
        )
        .setTimeout(30)
        .build();

    // sign the transaction
    transaction.sign(SorobanClient.Keypair.fromSecret(secretString));

    try {
        const transactionResult = await server.sendTransaction(transaction);
        console.log(transactionResult);
    } catch (err) {
        console.error(err);
    }
})()
```
