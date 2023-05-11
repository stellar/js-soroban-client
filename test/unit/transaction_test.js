const xdr = SorobanClient.xdr;

describe("assembleTransaction", () => {
  describe("FeeBumpTransaction", () => {
    // TODO: Add support for fee bump transactions
  });

  const simulationResponse = {
    transactionData: new SorobanClient.xdr.SorobanTransactionData({
      resources: new SorobanClient.xdr.SorobanResources({
        footprint: new SorobanClient.xdr.LedgerFootprint({
          readOnly: [],
          readWrite: [],
        }),
        instructions: 0,
        readBytes: 5,
        writeBytes: 0,
        extendedMetaDataSizeBytes: 0,
      }),
      refundableFee: SorobanClient.xdr.Int64.fromString("0"),
      ext: new SorobanClient.xdr.ExtensionPoint(0),
    }).toXDR("base64"),
    events: [],
    minResourceFee: "15",
    suggestedInclusionFee: "3",
    results: [
      {
        auth: [
          new SorobanClient.xdr.ContractAuth({
            addressWithNonce: null,
            rootInvocation: new SorobanClient.xdr.AuthorizedInvocation({
              contractId: Buffer.alloc(32),
              functionName: "fn",
              args: [],
              subInvocations: [],
            }),
            signatureArgs: [],
          }).toXDR("base64"),
        ],
        xdr: SorobanClient.xdr.ScVal.scvU32(0)
          .toXDR()
          .toString("base64"),
      },
    ],
    latestLedger: 3,
  };
  describe("Transaction", () => {
    const networkPassphrase = SorobanClient.Networks.TESTNET;
    const source = new SorobanClient.Account(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      "1",
    );

    function singleContractFnTransaction() {
      return new SorobanClient.TransactionBuilder(source, {
        fee: 100,
        networkPassphrase: "Test",
        v1: true,
      })
        .addOperation(
          SorobanClient.Operation.invokeHostFunction({
            args: new SorobanClient.xdr.HostFunctionArgs.hostFunctionTypeInvokeContract(
              [],
            ),
            auth: [],
          }),
        )
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();
    }

    it("simulate updates the tx data from simulation response", () => {
      const txn = singleContractFnTransaction();
      const result = SorobanClient.assembleTransaction(
        txn,
        networkPassphrase,
        simulationResponse,
      );

      // validate it auto updated the tx fees from sim response fees
      expect(
        result
          .toEnvelope()
          .tx()
          .fee(),
      ).to.equal(18);

      // validate it udpated sorobantransactiondata block in the tx ext
      expect(
        result
          .toEnvelope()
          .tx()
          .ext()
          .sorobanData()
          .resources()
          .readByes(),
      ).to.equal(5);
    });

    it("simulate adds the auth to the host function in tx operation", () => {
      const txn = singleContractFnTransaction();
      const result = SorobanClient.assembleTransaction(
        txn,
        networkPassphrase,
        simulationResponse,
      );

      expect(
        result
          .toEnvelope()
          .tx()
          .operations()[0]
          .body()
          .invokeHostFunctionOp()
          .functions()[0]
          .auth()[0],
      )
        .rootInvocation()
        .functionName()
        .to.equal("fn");
    });

    it("throws for non-invokehost-fn ops", () => {
      const txn = new SorobanClient.TransactionBuilder(source, {
        fee: 100,
        networkPassphrase,
        v1: true,
      })
        .addOperation(
          SorobanClient.Operation.changeTrust({
            asset: SorobanClient.Asset.native(),
          }),
        )
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();

      try {
        SorobanClient.assembleTransaction(txn, networkPassphrase, {
          transactionData: {},
          events: [],
          minResourceFee: "0",
          results: [],
          latestLedger: 3,
        });
        expect.fail();
      } catch (err) {
        expect(err.toString()).to.equal(
          "Error: unsupported operation type, must be only one InvokeHostFunctionOp in the transaction.",
        );
      }
    });

    it("throws for mismatched HostFunctions between simulation and tx", () => {
      const txn = new SorobanClient.TransactionBuilder(source, {
        fee: 100,
        networkPassphrase: "Test",
        v1: true,
      })
        .addOperation(
          SorobanClient.Operation.invokeHostFunctions({
            functions: [
              new xdr.HostFunction({
                args: new SorobanClient.xdr.HostFunctionArgs.hostFunctionTypeInvokeContract(
                  [],
                ),
                auth: [],
              }),
              new xdr.HostFunction({
                args: new SorobanClient.xdr.HostFunctionArgs.hostFunctionTypeInvokeContract(
                  [],
                ),
                auth: [],
              }),
            ],
          }),
        )
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();

      try {
        SorobanClient.assembleTransaction(
          txn,
          networkPassphrase,
          simulationResponse,
        );
        expect.fail();
      } catch (err) {
        expect(err.toString()).to.equal(
          "Error: preflight simulation results do not contain same count of HostFunctions that InvokeHostFunctionOp in the transaction has.",
        );
      }
    });

    it("handles no host functions", () => {
      const txn = new SorobanClient.TransactionBuilder(source, {
        fee: 100,
        networkPassphrase: "Test",
        v1: true,
      })
        .addOperation(
          SorobanClient.Operation.invokeHostFunctions({
            functions: [],
          }),
        )
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();

      const noSorobanData = new SorobanClient.xdr.SorobanTransactionData({
        resources: new SorobanClient.xdr.SorobanResources({
          footprint: new SorobanClient.xdr.LedgerFootprint({
            readOnly: [],
            readWrite: [],
          }),
          instructions: 0,
          readBytes: 0,
          writeBytes: 0,
          extendedMetaDataSizeBytes: 0,
        }),
        refundableFee: SorobanClient.xdr.Int64.fromString("0"),
        ext: new SorobanClient.xdr.ExtensionPoint(0),
      }).toXDR("base64");

      const result = SorobanClient.assembleTransaction(txn, networkPassphrase, {
        results: [],
        events: [],
        transactionData: noSorobanData,
      });

      expect(
        result
          .toEnvelope()
          .tx()
          .operations()[0]
          .body()
          .invokeHostFunctionOp()
          .functions(),
      ).to.have.length(0);
    });
  });
});
