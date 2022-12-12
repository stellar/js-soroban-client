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
 * @param {string} serverURL Soroban-RPC Server URL (ex. `https://soroban-rpc-testnet.stellar.org`).
 * @param {object} [opts] Options object
 * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use {@link Config} class to set this globally.
 * @param {string} [opts.appName] - Allow set custom header `X-App-Name`, default: `undefined`.
 * @param {string} [opts.appVersion] - Allow set custom header `X-App-Version`, default: `undefined`.
 */
export class Server {
  /**
   * serverURL Soroban-RPC Server URL (ex. `https://soroban-rpc-testnet.stellar.org`).
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
   * Allows you to directly inspect the current state of a contract. This is a backup way to access your contract data which may not be available via events or simulateTransaction.
   *
   * @deprecated Use {@link Server#getLedgerEntry} instead.
   * @param {string} contractId - The contract ID containing the data to load. Encoded as a hex string.
   * @param {xdr.ScVal} key - The key of the contract data to load.
   * @returns {Promise<SorobanRpc.GetContractDataResponse>} Returns a promise to the {@link SorobanRpc.GetContractDataResponse} object with the current value.
   */
  public async getContractData(
    contractId: string,
    key: xdr.ScVal,
  ): Promise<SorobanRpc.GetContractDataResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "getContractData",
      contractId,
      key.toXDR("base64"),
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
   * @param {xdr.ScVal} key - The key of the contract data to load.
   * @returns {Promise<SorobanRpc.GetLedgerEntryResponse>} Returns a promise to the {@link SorobanRpc.GetLedgerEntryResponse} object with the current value.
   */
  public async getLedgerEntry(
    key: xdr.ScVal,
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
   * @param {string} hash - The hash of the transaction to check. Encoded as a hex string.
   * @returns {Promise<SorobanRpc.GetTransactionStatusResponse>} Returns a promise to the {@link SorobanRpc.GetTransactionStatusResponse} object with the status, results, and error of the transaction.
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
   * Submit a trial contract invocation to get back return values, expected ledger footprint, and expected costs.
   *
   * @param {Transaction | FeeBumpTransaction} transaction - The transaction to simulate. It should include exactly one operation, which must be a {@link InvokeHostFunctionOp}. Any provided footprint will be ignored.
   * @returns {Promise<SorobanRpc.SimulateTransactionResponse>} Returns a promise to the {@link SorobanRpc.SimulateTransactionResponse} object with the cost, result, footprint, and error of the transaction.
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
   * Submit a real transaction to the Stellar network. This is the only way to make changes "on-chain".
   * Unlike Horizon, Soroban-RPC does not wait for transaction completion. It simply validates the transaction and enqueues it. Clients should call {@link Server#getTransactionStatus} to learn about transaction success/failure.
   *
   * @param {Transaction | FeeBumpTransaction} transaction - The transaction to submit.
   * @returns {Promise<SorobanRpc.SendTransactionResponse>} Returns a promise to the {@link SorobanRpc.SendTransactionResponse} object with the transaction id, status, and any error if available.
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
