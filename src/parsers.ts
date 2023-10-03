import { xdr, SorobanDataBuilder } from 'stellar-base';
import { SorobanRpc } from './soroban_rpc';



/**
 * Converts a raw response schema into one with parsed XDR fields and a
 * simplified interface.
 *
 * @param raw   the raw response schema (parsed ones are allowed, best-effort
 *    detected, and returned untouched)
 *
 * @returns the original parameter (if already parsed), parsed otherwise
 */
export function parseRawSimulation(
    sim:
      | SorobanRpc.SimulateTransactionResponse
      | SorobanRpc.RawSimulateTransactionResponse
  ): SorobanRpc.SimulateTransactionResponse {
    const looksRaw = SorobanRpc.isSimulationRaw(sim);
    if (!looksRaw) {
      // Gordon Ramsey in shambles
      return sim;
    }

    // shared across all responses
    let base: SorobanRpc.BaseSimulateTransactionResponse = {
      _parsed: true,
      id: sim.id,
      latestLedger: sim.latestLedger,
      events: sim.events?.map(
        evt => xdr.DiagnosticEvent.fromXDR(evt, 'base64')
      ) ?? [],
    };

    // error type: just has error string
    if (typeof sim.error === 'string') {
      return {
        ...base,
        error: sim.error,
      };
    }

    return parseSuccessful(sim, base);
  }

  function parseSuccessful(
    sim: SorobanRpc.RawSimulateTransactionResponse,
    partial: SorobanRpc.BaseSimulateTransactionResponse
  ):
    | SorobanRpc.SimulateTransactionRestoreResponse
    | SorobanRpc.SimulateTransactionSuccessResponse {

    // success type: might have a result (if invoking) and...
    const success: SorobanRpc.SimulateTransactionSuccessResponse = {
      ...partial,
      transactionData: new SorobanDataBuilder(sim.transactionData!),
      minResourceFee: sim.minResourceFee!,
      cost: sim.cost!,
      ...(
        // coalesce 0-or-1-element results[] list into a single result struct
        // with decoded fields if present
        (sim.results?.length ?? 0 > 0) &&
        {
          result: sim.results!.map(row => {
            return {
              auth: (row.auth ?? []).map((entry) =>
                xdr.SorobanAuthorizationEntry.fromXDR(entry, 'base64')),
              // if return value is missing ("falsy") we coalesce to void
              retval: !!row.xdr
                ? xdr.ScVal.fromXDR(row.xdr, 'base64')
                : xdr.ScVal.scvVoid()
            }
          })[0],
        }
      )
    };

    if (!sim.restorePreamble || sim.restorePreamble.transactionData === '') {
      return success;
    }

    // ...might have a restoration hint (if some state is expired)
    return {
      ...success,
      restorePreamble: {
        minResourceFee: sim.restorePreamble!.minResourceFee,
        transactionData: new SorobanDataBuilder(
          sim.restorePreamble!.transactionData
        ),
      }
    };
  }

export function parseLedgerEntries(
    raw: SorobanRpc.RawGetLedgerEntriesResponse
  ): SorobanRpc.GetLedgerEntriesResponse {
    return {
      latestLedger: raw.latestLedger,
      entries: (raw.entries ?? []).map(rawEntry => {
        if (!rawEntry.key || !rawEntry.xdr) {
          throw new TypeError(`invalid ledger entry: ${rawEntry}`);
        }

        return {
          lastModifiedLedgerSeq: rawEntry.lastModifiedLedgerSeq,
          key: xdr.LedgerKey.fromXDR(rawEntry.key, 'base64'),
          val: xdr.LedgerEntryData.fromXDR(rawEntry.xdr, 'base64'),
        };
      })
    };
  }
