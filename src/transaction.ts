import {
  Account,
  FeeBumpTransaction,
  Operation,
  Transaction,
  TransactionBuilder,
  xdr,
} from "stellar-base";

// TODO: Transaction is immutable, so we need to re-build it here. :(
export function assembleTransaction(
  raw: Transaction | FeeBumpTransaction,
  networkPassphrase: string,
  simulated: Array<null | {
    footprint: Buffer | string | xdr.LedgerFootprint;
    auth: Array<Buffer | string | xdr.ContractAuth>;
  }>,
): Transaction {
  if ("innerTransaction" in raw) {
    // TODO: Handle feebump transactions
    return assembleTransaction(
      raw.innerTransaction,
      networkPassphrase,
      simulated,
    );
  }

  if (simulated.length !== raw.operations.length) {
    throw new Error(
      "number of simulated operations not equal to number of transaction operations",
    );
  }

  // TODO: Figure out a cleaner way to clone this transaction.
  const source = new Account(raw.source, `${parseInt(raw.sequence, 10) - 1}`);
  const txn = new TransactionBuilder(source, {
    fee: raw.fee,
    memo: raw.memo,
    networkPassphrase,
    timebounds: raw.timeBounds,
    ledgerbounds: raw.ledgerBounds,
    minAccountSequence: raw.minAccountSequence,
    minAccountSequenceAge: raw.minAccountSequenceAge,
    minAccountSequenceLedgerGap: raw.minAccountSequenceLedgerGap,
    extraSigners: raw.extraSigners,
  });
  for (let i = 0; i < raw.operations.length; i++) {
    const rawOp = raw.operations[i];
    if ("function" in rawOp) {
      const sim = simulated[i];
      if (!sim) {
        throw new Error("missing simulated operation");
      }
      let footprint = sim.footprint;
      if (!(footprint instanceof xdr.LedgerFootprint)) {
        footprint = xdr.LedgerFootprint.fromXDR(footprint.toString(), "base64");
      }
      const auth = sim.auth.map((a) =>
        a instanceof xdr.ContractAuth
          ? a
          : xdr.ContractAuth.fromXDR(a.toString(), "base64"),
      );
      // TODO: Figure out a cleaner way to clone these operations
      txn.addOperation(
        Operation.invokeHostFunction({
          function: rawOp.function,
          parameters: rawOp.parameters,
          footprint,
          auth,
        }),
      );
    } else {
      // TODO: Handle this.
      throw new Error("Unsupported operation type");
    }
  }
  return txn.build();
}
