import { Account, FeeBumpTransaction, Operation, Transaction, TransactionBuilder, xdr } from "stellar-base";

// TODO: Transaction is immutable, so we need to re-build it here. :(
export function addFootprint(raw: Transaction | FeeBumpTransaction, networkPassphrase: string, footprint: Buffer | string | xdr.LedgerFootprint): Transaction {
  if (!(footprint instanceof xdr.LedgerFootprint)) {
    footprint = xdr.LedgerFootprint.fromXDR(footprint.toString(), 'base64');
  }
  if ('innerTransaction' in raw) {
    // TODO: Handle feebump transactions
    return addFootprint(raw.innerTransaction, networkPassphrase, footprint);
  }
  // TODO: Figure out a cleaner way to clone this transaction.
  const source = new Account(raw.source, `${parseInt(raw.sequence)-1}`);
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
  for (let rawOp of raw.operations) {
    if ('function' in rawOp) {
      // TODO: Figure out a cleaner way to clone these operations
      txn.addOperation(Operation.invokeHostFunction({
        function: rawOp.function,
        parameters: rawOp.parameters,
        footprint,
      }));
    } else {
      // TODO: Handle this.
      throw new Error("Unsupported operation type");
    }
  }
  return txn.build();
}
