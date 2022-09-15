/* tslint:disable:variable-name no-namespace */

import isEmpty from "lodash/isEmpty";
import merge from "lodash/merge";
import { FeeBumpTransaction, Transaction } from "stellar-base";
import URI from "urijs";

import * as jsonrpc from "./jsonrpc";

import { SorobanRpc } from "./soroban_rpc";

import axios from "./axios";

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
      axios.interceptors.request.use((config) => {
        // merge the custom headers with an existing headers
        config.headers = merge(customHeaders, config.headers);

        return config;
      });
    }

    if (this.serverURL.protocol() !== "https" && !opts.allowHttp) {
      throw new Error("Cannot connect to insecure soroban-rpc server");
    }
  }

  public async getTimebounds(
    _seconds: number,
    _isRetry: boolean = false,
  ): Promise<Server.Timebounds> {
    // TODO: Do we need this?
    throw new Error("Not implemented");
  }

  public async getHealth(): Promise<SorobanRpc.GetHealthResponse> {
    return await jsonrpc.post<SorobanRpc.GetHealthResponse>(
      this.serverURL.toString(),
      "getHealth",
    );
  }

  public async getAccount(
    _address: string,
  ): Promise<SorobanRpc.GetAccountResponse> {
    throw new Error("Not implemented");
  }

  /**
   * Send a transaction to the network.
   *
   * By default this function calls {@link Server#checkMemoRequired}, you can
   * skip this check by setting the option `skipMemoRequiredCheck` to `true`.
   *
   * If you submit any number of `manageOffer` operations, this will add an
   * attribute to the response that will help you analyze what happened with
   * your offers.
   *
   * Ex:
   * ```javascript
   * const res = {
   *   ...response,
   *   offerResults: [
   *     {
   *       // Exact ordered list of offers that executed, with the exception
   *       // that the last one may not have executed entirely.
   *       offersClaimed: [
   *         sellerId: String,
   *         offerId: String,
   *         assetSold: {
   *           type: 'native|credit_alphanum4|credit_alphanum12',
   *
   *           // these are only present if the asset is not native
   *           assetCode: String,
   *           issuer: String,
   *         },
   *
   *         // same shape as assetSold
   *         assetBought: {}
   *       ],
   *
   *       // What effect your manageOffer op had
   *       effect: "manageOfferCreated|manageOfferUpdated|manageOfferDeleted",
   *
   *       // Whether your offer immediately got matched and filled
   *       wasImmediatelyFilled: Boolean,
   *
   *       // Whether your offer immediately got deleted, if for example the order was too small
   *       wasImmediatelyDeleted: Boolean,
   *
   *       // Whether the offer was partially, but not completely, filled
   *       wasPartiallyFilled: Boolean,
   *
   *       // The full requested amount of the offer is open for matching
   *       isFullyOpen: Boolean,
   *
   *       // The total amount of tokens bought / sold during transaction execution
   *       amountBought: Number,
   *       amountSold: Number,
   *
   *       // if the offer was created, updated, or partially filled, this is
   *       // the outstanding offer
   *       currentOffer: {
   *         offerId: String,
   *         amount: String,
   *         price: {
   *           n: String,
   *           d: String,
   *         },
   *
   *         selling: {
   *           type: 'native|credit_alphanum4|credit_alphanum12',
   *
   *           // these are only present if the asset is not native
   *           assetCode: String,
   *           issuer: String,
   *         },
   *
   *         // same as `selling`
   *         buying: {},
   *       },
   *
   *       // the index of this particular operation in the op stack
   *       operationIndex: Number
   *     }
   *   ]
   * }
   * ```
   *
   * For example, you'll want to examine `offerResults` to add affordances like
   * these to your app:
   * * If `wasImmediatelyFilled` is true, then no offer was created. So if you
   *   normally watch the `Server.offers` endpoint for offer updates, you
   *   instead need to check `Server.trades` to find the result of this filled
   *   offer.
   * * If `wasImmediatelyDeleted` is true, then the offer you submitted was
   *   deleted without reaching the orderbook or being matched (possibly because
   *   your amounts were rounded down to zero). So treat the just-submitted
   *   offer request as if it never happened.
   * * If `wasPartiallyFilled` is true, you can tell the user that
   *   `amountBought` or `amountSold` have already been transferred.
   *
   * @see [Post
   * Transaction](https://developers.stellar.org/api/resources/transactions/post/)
   * @param {Transaction|FeeBumpTransaction} transaction - The transaction to submit.
   * @param {object} [opts] Options object
   * @param {boolean} [opts.skipMemoRequiredCheck] - Allow skipping memo
   * required check, default: `false`. See
   * [SEP0029](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0029.md).
   * @returns {Promise} Promise that resolves or rejects with response from
   * horizon.
   */
  public async sendTransaction(
    _transaction: Transaction | FeeBumpTransaction,
    _opts: Server.SubmitTransactionOptions = { skipMemoRequiredCheck: false },
  ): Promise<SorobanRpc.SendTransactionResponse> {
    throw new Error("Not Implemented");
  }

  /**
   * Check if any of the destination accounts requires a memo.
   *
   * This function implements a memo required check as defined in
   * [SEP0029](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0029.md).
   * It will load each account which is the destination and check if it has the
   * data field `config.memo_required` set to `"MQ=="`.
   *
   * Each account is checked sequentially instead of loading multiple accounts
   * at the same time from Horizon.
   *
   * @see
   * [SEP0029](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0029.md)
   * @param {Transaction} transaction - The transaction to check.
   * @returns {Promise<void, Error>} - If any of the destination account
   * requires a memo, the promise will throw {@link AccountRequiresMemoError}.
   * @throws  {AccountRequiresMemoError}
   */
  public async checkMemoRequired(
    _transaction: Transaction | FeeBumpTransaction,
  ): Promise<void> {
    // TODO: See if we need this
    throw new Error("Not implemented");
  }
}

export namespace Server {
  export interface Options {
    allowHttp?: boolean;
    timeout?: number;
    appName?: string;
    appVersion?: string;
  }

  export interface Timebounds {
    minTime: number;
    maxTime: number;
  }

  export interface SubmitTransactionOptions {
    skipMemoRequiredCheck?: boolean;
  }
}
