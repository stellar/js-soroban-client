---
title: Basic Examples
---

- [Creating a Soroban contract transaction](#creating-a-soroban-contract-transaction)

## Creating a Soroban contract transaction

The `js-soroban-client` exposes the [`TransactionBuilder`](https://stellar.github.io/js-stellar-base/TransactionBuilder.html) class from `js-stellar-base`.  There are more examples of [building transactions here](https://github.com/stellar/js-stellar-base/blob/master/docs/reference/base-examples.md). All those examples can be signed and submitted to Stellar in a similar manner as is done below.

In this example, the destination account must exist. The example is written
using modern Javascript, but `await` calls can also be rendered with promises.

```javascript
// Create, sign, and submit a transaction using JS Soroban Client.

// Assumes that you have the following items:
// 1. Secret key of a funded account to be the source account
// 2. Public key of an existing account as a recipient
//    These two keys can be created and funded by the friendbot at
//    https://laboratory.stellar.org under the heading "Quick Start: Test Account"
// 3. Access to JS Soroban Client (https://github.com/stellar/js-soroban-client)
//    either through Node.js or in the browser.

const SorobanClient = require('soroban-client');

// The source account is the account we will be signing and sending from.
const sourceSecretKey = 'SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4';

// Derive Keypair object and public key (that starts with a G) from the secret
const sourceKeypair = SorobanClient.Keypair.fromSecret(sourceSecretKey);
const sourcePublicKey = sourceKeypair.publicKey();

const receiverPublicKey = 'GAIRISXKPLOWZBMFRPU5XRGUUX3VMA3ZEWKBM5MSNRU3CHV6P4PYZ74D';

const contractId = '0000000000000000000000000000000000000000000000000000000000000001';

// Configure SorobanClient to talk to the soroban-rpc instance running on your
// local machine.
const server = new SorobanClient.Server(
  'http://localhost:8000/soroban/rpc',
  { allowHttp: true }
);

(async function main() {
  // Transactions require a valid sequence number that is specific to this account.
  // We can fetch the current sequence number for the source account from Horizon.
  const account = await server.getAccount(sourcePublicKey);

  // Right now, this is just the default fee for this example.
  const fee = 100;

  const contract = new SorobanClient.Contract(contractId);

  let transaction = new SorobanClient.TransactionBuilder(account, {
      fee,
      // Uncomment the following line to build transactions for the live network. Be
      // sure to also change the soroban-rpc hostname.
      // networkPassphrase: SorobanClient.Networks.PUBLIC,
      networkPassphrase: SorobanClient.Networks.STANDALONE
    })
    // Add a contract.increment soroban contract invocation operation
    .addOperation(contract.call("increment"))
    // Make this transaction valid for the next 30 seconds only
    .setTimeout(30)
    // Uncomment to add a memo (https://developers.stellar.org/docs/glossary/transactions/)
    // .addMemo(SorobanClient.Memo.text('Hello world!'))
    .build();

  // Simulate the transaction to discover the storage footprint, and update the
  // transaction to include it. If you already know the storage footprint you
  // can use `addFootprint` to add it yourself, skipping this step.
  transaction = await server.prepareTransaction(transaction);

  // Sign this transaction with the secret key
  // NOTE: signing is transaction is network specific. Test network transactions
  // won't work in the public network. To switch networks, use the Network object
  // as explained above (look for SorobanClient.Network).
  transaction.sign(sourceKeypair);

  // Let's see the XDR (encoded in base64) of the transaction we just built
  console.log(transaction.toEnvelope().toXDR('base64'));

  // Submit the transaction to the Soroban-RPC server. The Soroban-RPC server
  // will then submit the transaction into the network for us. Then we will have
  // to wait, polling getTransactionStatus until the transaction completes.
  try {
    let response = await server.sendTransaction(transaction);
    console.log('Sent! Transaction ID:', console.log(response.id));
    // Poll this until the status is not "pending"
    while (response.status === "pending") {
      // See if the transaction is complete
      response = await server.getTransactionStatus(response.id);
      // Wait a second
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('Transaction status:', response.status);
    console.log(JSON.stringify(response));
  } catch (e) {
    console.log('An error has occured:');
    console.log(e);
  }
})();
```
