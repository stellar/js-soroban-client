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

  export type TransactionStatus = "SUCCESS" | "NOT_FOUND" | "FAILED";

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

  /* Response for jsonrpc method `getNetwork`
   */
  export interface GetNetworkResponse {
    friendbotUrl?: string;
    passphrase: string;
    protocolVersion: string;
  }

  export interface GetTransactionResponse {
    status: TransactionStatus;
    latestLedger: string;
    latestLedgerCloseTime: string;
    oldestLedger: string;
    oldestLedgerCloseTime: string;
    id: string;

    applicationOrder?: number;
    resultXdr?: string;
    ledger?: string;
    createdAt?: string;
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
    results?: Array<{
      xdr: string;
      footprint: string;
      auth: string[];
    }>;
    error?: jsonrpc.Error;
    latestLedger: number;
  }
}
