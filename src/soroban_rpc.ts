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

  export interface GetHealthResponse {
    status: "healthy";
  }

  export interface LedgerEntryResult {
    key: string;
    // xdr is a base-64 encoded {@link xdr.LedgerEntryData}
    xdr: string;
    lastModifiedLedgerSeq?: number;
  }

  /* Response for jsonrpc method `getLedgerEntries`
   */
  export interface GetLedgerEntriesResponse {
    entries: LedgerEntryResult[];
    latestLedger: number;
  }

  /* Response for jsonrpc method `getNetwork`
   */
  export interface GetNetworkResponse {
    friendbotUrl?: string;
    passphrase: string;
    protocolVersion: string;
  }

  export type GetTransactionStatus = "SUCCESS" | "NOT_FOUND" | "FAILED";

  export interface GetTransactionResponse {
    status: GetTransactionStatus;
    latestLedger: number;
    latestLedgerCloseTime: number;
    oldestLedger: number;
    oldestLedgerCloseTime: number;

    // the fields below are set if status is SUCCESS
    applicationOrder?: number;
    feeBump?: boolean;
    envelopeXdr?: string;
    resultXdr?: string;
    resultMetaXdr?: string;
    ledger?: number;
    createdAt?: number;
  }

  export type EventType = "contract" | "system" | "diagnostic";

  export interface EventFilter {
    type?: EventType;
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
    inSuccessfulContractCall: boolean;
    topic: string[];
    value: {
      xdr: string;
    };
  }

  export interface RequestAirdropResponse {
    transaction_id: string;
  }

  export type SendTransactionStatus =
    | "PENDING"
    | "DUPLICATE"
    | "TRY_AGAIN_LATER"
    | "ERROR";

  export interface SendTransactionResponse {
    status: SendTransactionStatus;
    // errorResultXdr is only set when status is ERROR
    errorResultXdr?: string;
    hash: string;
    latestLedger: number;
    latestLedgerCloseTime: number;
  }

  export interface SimulateTransactionResponse {
    id: string;
    cost: Cost;
    results?: Array<{
      xdr: string;
      footprint: string;
      auth: string[];
      events: string[];
    }>;
    error?: jsonrpc.Error;
    latestLedger: number;
  }
}
