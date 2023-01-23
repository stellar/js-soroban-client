/* tslint:disable:variable-name no-namespace */

import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";
import { FeeBumpTransaction, Transaction, xdr } from "stellar-base";
import URI from "urijs";

import * as jsonrpc from "./jsonrpc";

import { SorobanRpc } from "./soroban_rpc";

import AxiosClient from "./axios";

export const SUBMIT_TRANSACTION_TIMEOUT = 60 * 1000;

/**
 * Server handles the network connection to a [Soroban-RPC](https://soroban.stellar.org/docs)
 * instance and exposes an interface for requests to that instance.
 * @constructor
 * @param {string} serverURL Soroban-RPC Server URL (ex. `http://localhost:8000/soroban/rpc`).
 * @param {object} [opts] Options object
 * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use {@link Config} class to set this globally.
 * @param {string} [opts.appName] - Allow set custom header `X-App-Name`, default: `undefined`.
 * @param {string} [opts.appVersion] - Allow set custom header `X-App-Version`, default: `undefined`.
 */
export class Server {
  /**
   * serverURL Soroban-RPC Server URL (ex. `http://localhost:8000/soroban/rpc`).
   */
  public readonly serverURL: URI;

  constructor(serverURL: string, opts: Server.Options = {}) {
    this.serverURL = URI(serverURL);

    const customHeaders: any = {};

    if (opts.appName) {
      customHeaders["X-App-Name"] = opts.appName;
    }
    if (opts.appVersion) {
      customHeaders["X-App-Version"] = opts.appVersion;
    }
    if (!isEmpty(customHeaders)) {
      AxiosClient.interceptors.request.use((config: any) => {
        // merge the custom headers with an existing headers
        config.headers = merge(customHeaders, config.headers);

        return config;
      });
    }

    if (this.serverURL.protocol() !== "https" && !opts.allowHttp) {
      throw new Error("Cannot connect to insecure soroban-rpc server");
    }
  }

  /**
   * Fetch a minimal set of current info about a Stellar account.
   *
   * Needed to get the current sequence number for the account so you can build
   * a successful transaction with {@link TransactionBuilder}.
   *
   * @example
   * server.getAccount("GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4").then(account => {
   *   console.log("sequence:", account.sequence);
   * });
   *
   * @param {string} address - The public address of the account to load.
   * @returns {Promise<SorobanRpc.GetAccountResponse>} Returns a promise to the {@link SorobanRpc.GetAccountResponse} object with populated sequence number.
   */
  public async getAccount(
    address: string,
  ): Promise<SorobanRpc.GetAccountResponse> {
    return await jsonrpc.post(this.serverURL.toString(), "getAccount", address);
  }

  /**
   * General node health check.
   *
   * @example
   * server.getHealth().then(health => {
   *   console.log("status:", health.status);
   * });
   *
   * @returns {Promise<SorobanRpc.GetHealthResponse>} Returns a promise to the {@link SorobanRpc.GetHealthResponse} object with the status of the server ("healthy").
   */
  public async getHealth(): Promise<SorobanRpc.GetHealthResponse> {
    return await jsonrpc.post<SorobanRpc.GetHealthResponse>(
      this.serverURL.toString(),
      "getHealth",
    );
  }

  /**
   * Reads the current value of contract data ledger entries directly.
   *
   * @example
   * const contractId = "0000000000000000000000000000000000000000000000000000000000000001";
   * const key = xdr.ScVal.scvSymbol("counter");
   * server.getContractData(contractId, key).then(data => {
   *   console.log("value:", data.xdr);
   *   console.log("lastModified:", data.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", data.latestLedger);
   * });
   *
   * Allows you to directly inspect the current state of a contract. This is a backup way to access your contract data which may not be available via events or simulateTransaction.
   *
   * @param {string} contractId - The contract ID containing the data to load. Encoded as a hex string.
   * @param {xdr.ScVal} key - The key of the contract data to load.
   * @returns {Promise<SorobanRpc.GetLedgerEntryResponse>} Returns a promise to the {@link SorobanRpc.GetLedgerEntryResponse} object with the current value.
   */
  public async getContractData(
    contractId: string,
    key: xdr.ScVal,
  ): Promise<SorobanRpc.GetLedgerEntryResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "getLedgerEntry",
      xdr.LedgerKey.contractData(
        new xdr.LedgerKeyContractData({
          contractId: Buffer.from(contractId, "hex"),
          key,
        }),
      ).toXDR("base64"),
    );
  }

  /**
   * Reads the current value of ledger entries directly.
   *
   * Allows you to directly inspect the current state of a contract,
   * contract's code, or any other ledger entry. This is a backup way to access
   * your contract data which may not be available via events or
   * simulateTransaction.
   *
   * To fetch contract wasm byte-code, use the ContractCode ledger entry key.
   *
   * @example
   * const contractId = "0000000000000000000000000000000000000000000000000000000000000001";
   * const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
   *   contractId: Buffer.from(contractId, "hex"),
   *   key: xdr.ScVal.scvSymbol("counter"),
   * }));
   * server.getLedgerEntry(key).then(data => {
   *   console.log("value:", data.xdr);
   *   console.log("lastModified:", data.lastModifiedLedgerSeq);
   *   console.log("latestLedger:", data.latestLedger);
   * });
   *
   * @param {xdr.ScVal} key - The key of the contract data to load.
   * @returns {Promise<SorobanRpc.GetLedgerEntryResponse>} Returns a promise to the {@link SorobanRpc.GetLedgerEntryResponse} object with the current value.
   */
  public async getLedgerEntry(
    key: xdr.LedgerKey,
  ): Promise<SorobanRpc.GetLedgerEntryResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "getLedgerEntry",
      key.toXDR("base64"),
    );
  }

  /**
   * Fetch the status, result, and/or error of a submitted transaction.
   *
   * When submitting a transaction, clients should poll this to tell when the
   * transaction has completed.
   *
   * @example
   * const transactionHash = "c4515e3bdc0897f21cc5dbec8c82cf0a936d4741cb74a8e158eb51b9fb00411a";
   * server.getTransactionStatus(transactionHash).then(transaction => {
   *   console.log("status:", transaction.status);
   *   console.log("envelopeXdr:", transaction.envelopeXdr);
   *   console.log("resultMetaXdr:", transaction.resultMetaXdr);
   *   console.log("resultXdr:", transaction.resultXdr);
   *   console.log("error:", transaction.error);
   * });
   *
   * @param {string} hash - The hash of the transaction to check. Encoded as a
   *    hex string.
   *
   * @returns {Promise<SorobanRpc.GetTransactionStatusResponse>} Returns a
   *    promise to the {@link SorobanRpc.GetTransactionStatusResponse} object
   *    with the status, results, and error of the transaction.
   */
  public async getTransactionStatus(
    hash: string,
  ): Promise<SorobanRpc.GetTransactionStatusResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "getTransactionStatus",
      hash,
    );
  }

  /**
   * Fetches all events that match a given set of filters.
   *
   * The given filters (see {@link SorobanRpc.EventFilter} for detailed fields)
   * are combined only in a logical OR fashion, and all of the fields in each
   * filter are optional.
   *
   * To page through events, use the `pagingToken` field on the relevant
   * {@link SorobanRpc.EventResponse} object to set the `cursor` parameter.
   *
   * @example
   * server.getEvents(
   *    1000,
   *    1010,
   *    [
   *     {
   *      type: "contract",
   *      contractIds: [ "deadb33f..." ],
   *      topics: [[ "AAAABQAAAAh0cmFuc2Zlcg==", "AAAAAQB6Mcc=", "*" ]],
   *     }, {
   *      type: "system",
   *      contractIds: [ "...c4f3b4b3..." ],
   *      topics: [[ "*" ], [ "*", "AAAAAQB6Mcc=" ]],
   *     }, {
   *      contractIds: [ "...c4f3b4b3..." ],
   *      topics: [[ "AAAABQAAAAh0cmFuc2Zlcg==" ]],
   *     }, {
   *      topics: [[ "AAAAAQB6Mcc=" ]],
   *     }
   *    ],
   *    "0164090849041387521-0000000000",
   *    10,
   * );
   *
   * @returns {Promise<SorobanRpc.GetEventsResponse>} a promise to the
   *    {@link SorobanRpc.GetEventsResponse} object containing a paginatable set
   *    of the events matching the given event filters.
   */
  public async getEvents(
    startLedger: number,
    endLedger: number,
    filters?: SorobanRpc.EventFilter[],
    cursor?: string,
    limit?: number,
  ): Promise<SorobanRpc.GetEventsResponse> {
    // TODO: It'd be nice if we could do something to infer the types of filter
    // arguments a user wants, e.g. converting something like "transfer/*/42"
    // into the base64-encoded `ScVal` equivalents by inferring that the first
    // is an ScSymbol and the last is a U32.
    //
    // The difficulty comes in matching up the correct integer primitives.
    //
    // It also means this library will rely on the XDR definitions.
    return await jsonrpc.post(this.serverURL.toString(), "getEvents", {
      startLedger,
      endLedger,
      filters: filters ?? [],
      pagination: {
        ...(cursor && { cursor }), // add fields only if defined
        ...(limit && { limit }),
      },
    });
  }

  /**
   * Submit a trial contract invocation to get back return values, expected
   * ledger footprint, and expected costs.
   *
   * @example
   * const contractId = '0000000000000000000000000000000000000000000000000000000000000001';
   * const contract = new SorobanClient.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = 100;
   *
   * const transaction = new SorobanClient.TransactionBuilder(account, {
   *     fee,
   *     // Uncomment the following line to build transactions for the live network. Be
   *     // sure to also change the horizon hostname.
   *     // networkPassphrase: SorobanClient.Networks.PUBLIC,
   *     networkPassphrase: SorobanClient.Networks.TESTNET
   *   })
   *   // Add a contract.increment soroban contract invocation operation
   *   .addOperation(contract.call("increment"))
   *   // Make this transaction valid for the next 30 seconds only
   *   .setTimeout(30)
   *   // Uncomment to add a memo (https://developers.stellar.org/docs/glossary/transactions/)
   *   // .addMemo(SorobanClient.Memo.text('Hello world!'))
   *   .build();
   *
   * // Sign this transaction with the secret key
   * // NOTE: signing is transaction is network specific. Test network transactions
   * // won't work in the public network. To switch networks, use the Network object
   * // as explained above (look for SorobanClient.Network).
   * const sourceKeypair = SorobanClient.Keypair.fromSecret(sourceSecretKey);
   * transaction.sign(sourceKeypair);
   *
   * server.simulateTransaction(transaction).then(sim => {
   *   console.log("cost:", sim.cost);
   *   console.log("footprint:", sim.footprint);
   *   console.log("results:", sim.results);
   *   console.log("error:", sim.error);
   *   console.log("latestLedger:", sim.latestLedger);
   * });
   *
   * @param {Transaction | FeeBumpTransaction} transaction - The transaction to
   *    simulate. It should include exactly one operation, which must be a
   *    {@link InvokeHostFunctionOp}. Any provided footprint will be ignored.
   * @returns {Promise<SorobanRpc.SimulateTransactionResponse>} Returns a
   *    promise to the {@link SorobanRpc.SimulateTransactionResponse} object
   *    with the cost, result, footprint, and error of the transaction.
   */
  public async simulateTransaction(
    transaction: Transaction | FeeBumpTransaction,
  ): Promise<SorobanRpc.SimulateTransactionResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "simulateTransaction",
      transaction.toXDR(),
    );
  }

  /**
   * Submit a real transaction to the Stellar network. This is the only way to
   * make changes "on-chain". Unlike Horizon, Soroban-RPC does not wait for
   * transaction completion. It simply validates the transaction and enqueues
   * it. Clients should call {@link Server#getTransactionStatus} to learn about
   * transaction success/failure.
   *
   * @example
   * const contractId = '0000000000000000000000000000000000000000000000000000000000000001';
   * const contract = new SorobanClient.Contract(contractId);
   *
   * // Right now, this is just the default fee for this example.
   * const fee = 100;
   *
   * const transaction = new SorobanClient.TransactionBuilder(account, {
   *     fee,
   *     // Uncomment the following line to build transactions for the live network. Be
   *     // sure to also change the horizon hostname.
   *     // networkPassphrase: SorobanClient.Networks.PUBLIC,
   *     networkPassphrase: SorobanClient.Networks.TESTNET
   *   })
   *   // Add a contract.increment soroban contract invocation operation
   *   // Note: For real transactions you will need to include the footprint in
   *   // the operation, as returned from simulateTransaction.
   *   .addOperation(contract.call("increment"))
   *   // Make this transaction valid for the next 30 seconds only
   *   .setTimeout(30)
   *   // Uncomment to add a memo (https://developers.stellar.org/docs/glossary/transactions/)
   *   // .addMemo(SorobanClient.Memo.text('Hello world!'))
   *   .build();
   *
   * // Sign this transaction with the secret key
   * // NOTE: signing is transaction is network specific. Test network transactions
   * // won't work in the public network. To switch networks, use the Network object
   * // as explained above (look for SorobanClient.Network).
   * const sourceKeypair = SorobanClient.Keypair.fromSecret(sourceSecretKey);
   * transaction.sign(sourceKeypair);
   *
   * server.sendTransaction(transaction).then(result => {
   *   console.log("id:", result.id);
   *   console.log("error:", result.error);
   * });
   *
   * @param {Transaction | FeeBumpTransaction} transaction - The transaction to
   *    submit.
   * @returns {Promise<SorobanRpc.SendTransactionResponse>} Returns a promise to
   *    the {@link SorobanRpc.SendTransactionResponse} object with the
   *    transaction id, status, and any error if available.
   */
  public async sendTransaction(
    transaction: Transaction | FeeBumpTransaction,
  ): Promise<SorobanRpc.SendTransactionResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "sendTransaction",
      transaction.toXDR(),
    );
  }
}

export namespace Server {
  export interface Options {
    allowHttp?: boolean;
    timeout?: number;
    appName?: string;
    appVersion?: string;
  }
}
