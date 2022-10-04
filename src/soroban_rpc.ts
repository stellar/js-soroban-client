import { AssetType } from "stellar-base";
import * as jsonrpc from "./jsonrpc";

// TODO: Better parsing for hashes, and base64-encoded xdr

/* tslint:disable-next-line:no-namespace */
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

  export interface GetAccountResponse {
    id: string; // TODO: is this address a string?
    sequence: string;
    balances: Balance[];
  }

  export interface GetHealthResponse {
    status: "healthy";
  }

  export interface GetContractDataResponse {
    xdr: string;
    lastModifiedLedgerSeq?: number;
    latestLedger?: number;
  }

  export interface GetTransactionStatusResponse {
    id: string;
    status: TransactionStatus;
    results?: Result[];
    error?: jsonrpc.Error;
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
