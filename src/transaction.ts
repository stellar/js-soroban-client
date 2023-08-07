import {
  FeeBumpTransaction,
  Operation,
  Transaction,
  TransactionBuilder,
  xdr,
} from "stellar-base";

import { SorobanRpc } from "./soroban_rpc";

/**
 * Combines the given raw transaction alongside the simulation results.
 *
 * @param raw   the initial transaction, w/o simulation applied
 * @param networkPassphrase   the network this simulation applies to
 * @param simulation  the Soroban RPC simulation result
 *
 * @returns a new, cloned transaction with the proper auth and resource (fee,
 *    footprint) simulation data applied
 *
 * @note if the given transaction already has authorization entries in a host
 *    function invocation (see {@link Operation.invokeHostFunction}), **the
 *    simulation entries are ignored**.
 *
 * @see {Server.simulateTransaction}
 * @see {Server.prepareTransaction}
 */
export function assembleTransaction(
  raw: Transaction | FeeBumpTransaction,
  networkPassphrase: string,
  simulation: SorobanRpc.SimulateTransactionResponse
): Transaction {
  if ("innerTransaction" in raw) {
    // TODO: Handle feebump transactions
    return assembleTransaction(
      raw.innerTransaction,
      networkPassphrase,
      simulation
    );
  }

  if (!isSorobanTransaction(raw)) {
    throw new TypeError(
      "unsupported transaction: must contain exactly one " +
        "invokeHostFunction, bumpFootprintExpiration, or restoreFootprint " +
        "operation"
    );
  }

  if (simulation.results.length !== 1) {
    throw new Error(`simulation results invalid: ${simulation.results}`);
  }

  const classicFeeNum = parseInt(raw.fee, 10) || 0;
  const minResourceFeeNum = parseInt(simulation.minResourceFee, 10) || 0;

  const txnBuilder = TransactionBuilder.cloneFrom(raw, {
    // automatically update the tx fee that will be set on the resulting tx to
    // the sum of 'classic' fee provided from incoming tx.fee and minResourceFee
    // provided by simulation.
    //
    // 'classic' tx fees are measured as the product of tx.fee * 'number of
    // operations', In soroban contract tx, there can only be single operation
    // in the tx, so can make simplification of total classic fees for the
    // soroban transaction will be equal to incoming tx.fee + minResourceFee.
    fee: (classicFeeNum + minResourceFeeNum).toString(),
    // apply the pre-built Soroban Tx Data from simulation onto the Tx
    sorobanData: simulation.transactionData,
  });

  switch (raw.operations[0].type) {
    case "invokeHostFunction":
      // In this case, we don't want to clone the operation, so we drop it.
      // @ts-ignore hack because `TransactionBuilder.operations` is private
      txnBuilder.operations = [];

      const invokeOp: Operation.InvokeHostFunction = raw.operations[0];
      const existingAuth = invokeOp.auth ?? [];
      txnBuilder.addOperation(
        Operation.invokeHostFunction({
          source: invokeOp.source,
          func: invokeOp.func,
          // if auth entries are already present, we consider this "advanced
          // usage" and disregard ALL auth entries from the simulation
          //
          // the intuition is "if auth exists, this tx has probably been
          // simulated before"
          auth:
            existingAuth.length > 0
              ? existingAuth
              : simulation.results[0].auth?.map((a) =>
                  xdr.SorobanAuthorizationEntry.fromXDR(a, "base64")
                ) ?? [],
        })
      );
      break;
  }

  return txnBuilder.build();
}

function isSorobanTransaction(tx: Transaction): boolean {
  if (tx.operations.length !== 1) {
    return false;
  }

  switch (tx.operations[0].type) {
    case "invokeHostFunction":
    case "bumpFootprintExpiration":
    case "restoreFootprint":
      return true;

    default:
      return false;
  }
}
