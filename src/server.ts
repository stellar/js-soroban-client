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
 * Server handles the network connection to a [Horizon](https://developers.stellar.org/api/introduction/)
 * instance and exposes an interface for requests to that instance.
 * @constructor
 * @param {string} serverURL Horizon Server URL (ex. `https://horizon-testnet.stellar.org`).
 * @param {object} [opts] Options object
 * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments! You can also use {@link Config} class to set this globally.
 * @param {string} [opts.appName] - Allow set custom header `X-App-Name`, default: `undefined`.
 * @param {string} [opts.appVersion] - Allow set custom header `X-App-Version`, default: `undefined`.
 */
export class Server {
  /**
   * serverURL Horizon Server URL (ex. `https://soroban-rpc-testnet.stellar.org`).
   *
   * TODO: Solve `URI(this.serverURL as any)`.
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
      AxiosClient.interceptors.request.use((config) => {
        // merge the custom headers with an existing headers
        config.headers = merge(customHeaders, config.headers);

        return config;
      });
    }

    if (this.serverURL.protocol() !== "https" && !opts.allowHttp) {
      throw new Error("Cannot connect to insecure soroban-rpc server");
    }
  }

  public async getAccount(
    address: string,
  ): Promise<SorobanRpc.GetAccountResponse> {
    return await jsonrpc.post(this.serverURL.toString(), "getAccount", address);
  }

  public async getHealth(): Promise<SorobanRpc.GetHealthResponse> {
    return await jsonrpc.post<SorobanRpc.GetHealthResponse>(
      this.serverURL.toString(),
      "getHealth",
    );
  }

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

  public async getTransactionStatus(
    hash: string,
  ): Promise<SorobanRpc.GetTransactionStatusResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "getTransactionStatus",
      hash,
    );
  }

  public async simulateTransaction(
    transaction: Transaction | FeeBumpTransaction,
  ): Promise<SorobanRpc.SimulateTransactionResponse> {
    return await jsonrpc.post(
      this.serverURL.toString(),
      "simulateTransaction",
      transaction.toXDR(),
    );
  }

  public async sendTransaction(
    transaction: Transaction | FeeBumpTransaction,
  ): Promise<SorobanRpc.SimulateTransactionResponse> {
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
