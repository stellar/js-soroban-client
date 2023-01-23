import { AssetType } from "stellar-base";
import * as jsonrpc from "./jsonrpc";

// TODO: Better parsing for hashes, and base64-encoded xdr

/* tslint:disable-next-line:no-namespace */
/* @namespace SorobanRpc
 */
export namespace SorobanRpc {
  export interface Balance {
    asset_type: AssetType.credit4 | AssetType.credit12;
    asset_code: string;
    asset_issuer: string;
    classic: string;
    smart: string;
  }

  export interface Cost {
    cpuInsns: string;
    memBytes: string;
  }

  export interface Result {
    xdr: string;
  }

  export type TransactionStatus = "pending" | "success" | "error";

  /* Response for jsonrpc method `getAccount`
   * @interface SorobanRpc.GetAccountResponse
   */
  export interface GetAccountResponse {
    id: string;
    sequence: string;
    balances: Balance[];
  }

  export interface GetHealthResponse {
    status: "healthy";
  }

  /* Response for jsonrpc method `getLedgerEntry`
   */
  export interface GetLedgerEntryResponse {
    // xdr is a base-64 encoded {@link xdr.LedgerEntryData}
    xdr: string;
    lastModifiedLedgerSeq?: number;
    latestLedger?: number;
  }

  export interface GetTransactionStatusResponse {
    id: string;
    status: TransactionStatus;
    envelopeXdr?: string;
    resultXdr?: string;
    resultMetaXdr?: string;
    results?: Result[];
    error?: jsonrpc.Error;
  }

  export interface EventFilter {
    type?: string;
    contractIds?: string[];
    topics?: string[][];
  }

  export interface GetEventsResponse {
    events?: EventResponse[];
  }

  export interface EventResponse {
    ledger: string;
    ledgerClosedAt: string;
    contractId: string;
    id: string;
    pagingToken: string;
    topic: string[];
    value: {
      xdr: string;
    };
  }

  export interface RequestAirdropResponse {
    transaction_id: string;
  }

  export interface SendTransactionResponse {
    id: string;
    error?: jsonrpc.Error;
  }

  export interface SimulateTransactionResponse {
    id: string;
    cost: Cost;
    footprint: string;
    results?: Result[];
    error?: jsonrpc.Error;
    latestLedger: number;
  }
}
