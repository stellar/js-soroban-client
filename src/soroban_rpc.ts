import { AssetType, SorobanDataBuilder, xdr } from "stellar-base";

// TODO: Better parsing for hashes

/* tslint:disable-next-line:no-namespace */
/**
 * @namespace SorobanRpc
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
    lastModifiedLedgerSeq?: number;
    /** a base-64 encoded {@link xdr.LedgerKey} instance */
    key: string;
    /** a base-64 encoded {@link xdr.LedgerEntryData} instance */
    xdr: string;
  }

  /* Response for jsonrpc method `getLedgerEntries`
   */
  export interface GetLedgerEntriesResponse {
    entries: LedgerEntryResult[] | null;
    latestLedger: number;
  }

  /* Response for jsonrpc method `getNetwork`
   */
  export interface GetNetworkResponse {
    friendbotUrl?: string;
    passphrase: string;
    protocolVersion: string;
  }

  /* Response for jsonrpc method `getLatestLedger`
   */
  export interface GetLatestLedgerResponse {
    id: string;
    sequence: number;
    protocolVersion: string;
  }

  export enum GetTransactionStatus {
    SUCCESS = "SUCCESS",
    NOT_FOUND = "NOT_FOUND",
    FAILED = "FAILED"
  }

  export type GetTransactionResponse =
    | GetSuccessfulTransactionResponse
    | GetFailedTransactionResponse
    | GetMissingTransactionResponse;

  interface GetAnyTransactionResponse {
    status: GetTransactionStatus;
    latestLedger: number;
    latestLedgerCloseTime: number;
    oldestLedger: number;
    oldestLedgerCloseTime: number;
  }

  export interface GetMissingTransactionResponse extends GetAnyTransactionResponse {
    status: GetTransactionStatus.NOT_FOUND;
  }

  export interface GetFailedTransactionResponse extends GetAnyTransactionResponse {
    status: GetTransactionStatus.FAILED;
  }

  export interface GetSuccessfulTransactionResponse extends GetAnyTransactionResponse {
    status: GetTransactionStatus.SUCCESS;

    ledger: number;
    createdAt: number;
    applicationOrder: number;
    feeBump: boolean;
    envelopeXdr: xdr.TransactionEnvelope;
    resultXdr: xdr.TransactionResult;
    resultMetaXdr: xdr.TransactionMeta;

    returnValue?: xdr.ScVal;  // present iff resultMeta is a v3
  }

  export interface RawGetTransactionResponse {
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
    latestLedger: number;
    events: EventResponse[];
  }

  export interface EventResponse {
    type: EventType;
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

  export interface SimulateHostFunctionResult {
    auth: xdr.SorobanAuthorizationEntry[];
    retval: xdr.ScVal;
  }

  export interface SimulateTransactionResponse {
    id: string;
    error?: string;
    transactionData: SorobanDataBuilder;
    events: xdr.DiagnosticEvent[];
    minResourceFee: string;
    // only present if error isn't
    result?: SimulateHostFunctionResult;
    latestLedger: number;
    cost: Cost;
  }

  export interface RawSimulateHostFunctionResult {
    // each string is SorobanAuthorizationEntry XDR in base64
    auth?: string[];
    // invocation return value: the ScVal in base64
    xdr: string;
  }

  export interface RawSimulateTransactionResponse {
    id: string;
    error?: string;
    // this is SorobanTransactionData XDR in base64
    transactionData: string;
    events: string[];
    minResourceFee: string;
    // This will only contain a single element, because only a single
    // invokeHostFunctionOperation is supported per transaction.
    results?: RawSimulateHostFunctionResult[];
    latestLedger: number;
    cost: Cost;
  }
}
