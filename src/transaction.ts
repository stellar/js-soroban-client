import {
  Account,
  FeeBumpTransaction,
  Operation,
  Transaction,
  TransactionBuilder,
  xdr,
} from "stellar-base";
import { SorobanRpc } from "./soroban_rpc";

// TODO: Transaction is immutable, so we need to re-build it here. :(
export function assembleTransaction(
  raw: Transaction | FeeBumpTransaction,
  networkPassphrase: string,
  simulation: SorobanRpc.SimulateTransactionResponse,
): Transaction {
  if ("innerTransaction" in raw) {
    // TODO: Handle feebump transactions
    return assembleTransaction(
      raw.innerTransaction,
      networkPassphrase,
      simulation,
    );
  }

  if (
    raw.operations.length !== 1 ||
    raw.operations[0].type !== "invokeHostFunction"
  ) {
    throw new Error(
      "unsupported operation type, must be only one InvokeHostFunctionOp in the transaction.",
    );
  }

  const rawInvokeHostFunctionOp: any = raw.operations[0];

  if (
    !rawInvokeHostFunctionOp.functions ||
    !simulation.results ||
    rawInvokeHostFunctionOp.functions.length !== simulation.results.length
  ) {
    throw new Error(
      "preflight simulation results do not contain same count of HostFunctions that InvokeHostFunctionOp in the transaction has.",
    );
  }

  const source = new Account(raw.source, `${parseInt(raw.sequence, 10) - 1}`);
  const authDecoratedHostFunctions: xdr.HostFunction[] = [];

  const txnBuilder = new TransactionBuilder(source, {
    fee: Math.max(
      parseInt(raw.fee, 10) || 0,
      parseInt(simulation.minResourceFee, 10) || 0,
    ).toString(),
    memo: raw.memo,
    networkPassphrase,
    timebounds: raw.timeBounds,
    ledgerbounds: raw.ledgerBounds,
    minAccountSequence: raw.minAccountSequence,
    minAccountSequenceAge: raw.minAccountSequenceAge,
    minAccountSequenceLedgerGap: raw.minAccountSequenceLedgerGap,
    extraSigners: raw.extraSigners,
  });

  // apply the pre-built Auth from simulation onto each Tx/Op/HostFunction invocation
  for (
    let hostFnIndex = 0;
    hostFnIndex < simulation.results.length;
    hostFnIndex++
  ) {
    const rawHostFunction: xdr.HostFunction =
      rawInvokeHostFunctionOp.functions[hostFnIndex];
    const simHostFunctionResult: SorobanRpc.SimulateHostFunctionResult =
      simulation.results[hostFnIndex];
    rawHostFunction.auth(buildContractAuth(simHostFunctionResult.auth));
    authDecoratedHostFunctions.push(rawHostFunction);
  }

  txnBuilder.addOperation(
    Operation.invokeHostFunctions({
      functions: authDecoratedHostFunctions,
    }),
  );

  // apply the pre-built Soroban Tx Ext from simulation onto the Tx
  txnBuilder.setExt(buildExt(simulation.transactionData));

  return txnBuilder.build();
}

function buildExt(sorobanTxDataStr: string) {
  const sorobanTxData: xdr.SorobanTransactionData = xdr.SorobanTransactionData.fromXDR(
    sorobanTxDataStr,
    "base64",
  );
  const txExt: xdr.TransactionExt = new xdr.TransactionExt(1);
  txExt.sorobanData(sorobanTxData);
  return txExt;
}

function buildContractAuth(auths: string[]): xdr.ContractAuth[] {
  const contractAuths: xdr.ContractAuth[] = [];
  for (const authStr of auths) {
    contractAuths.push(xdr.ContractAuth.fromXDR(authStr, "base64"));
  }
  return contractAuths;
}
