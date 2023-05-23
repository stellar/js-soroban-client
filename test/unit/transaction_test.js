describe("assembleTransaction", () => {
  describe("FeeBumpTransaction", () => {
    // TODO: Add support for fee bump transactions
  });

  const fnAuth = new SorobanClient.xdr.ContractAuth({
    addressWithNonce: new SorobanClient.xdr.AddressWithNonce({
      address: SorobanClient.xdr.ScAddress.scAddressTypeAccount(
        SorobanClient.xdr.PublicKey.publicKeyTypeEd25519(
          SorobanClient.StrKey.decodeEd25519PublicKey(
            "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI"
          )
        )
      ),
      nonce: SorobanClient.xdr.Uint64.fromString("0"),
    }),
    rootInvocation: new SorobanClient.xdr.AuthorizedInvocation({
      contractId: Buffer.alloc(32),
      functionName: Buffer.from("fn"),
      args: [],
      subInvocations: [],
    }),
    signatureArgs: [],
  });

  const sorobanTransactionData = new SorobanClient.xdr.SorobanTransactionData({
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
  });

  const simulationResponse = {
    transactionData: sorobanTransactionData.toXDR("base64"),
    events: [],
    minResourceFee: "115",
    results: [
      {
        auth: [fnAuth.toXDR("base64")],
        xdr: SorobanClient.xdr.ScVal.scvU32(0).toXDR().toString("base64"),
      },
    ],
    latestLedger: 3,
    cost: {
      cpuInsns: "0",
      memBytes: "0",
    },
  };
  describe("Transaction", () => {
    const networkPassphrase = SorobanClient.Networks.TESTNET;
    const source = new SorobanClient.Account(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      "1"
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
              []
            ),
            auth: [],
          })
        )
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();
    }

    it("simulate updates the tx data from simulation response", () => {
      const txn = singleContractFnTransaction();
      const result = SorobanClient.assembleTransaction(
        txn,
        networkPassphrase,
        simulationResponse
      );

      // validate it auto updated the tx fees from sim response fees
      // since it was greater than tx.fee
      expect(result.toEnvelope().v1().tx().fee()).to.equal(215);

      // validate it udpated sorobantransactiondata block in the tx ext
      expect(result.toEnvelope().v1().tx().ext().sorobanData()).to.deep.equal(
        sorobanTransactionData
      );
    });

    it("simulate adds the auth to the host function in tx operation", () => {
      const txn = singleContractFnTransaction();
      const result = SorobanClient.assembleTransaction(
        txn,
        networkPassphrase,
        simulationResponse
      );

      expect(
        result
          .toEnvelope()
          .v1()
          .tx()
          .operations()[0]
          .body()
          .invokeHostFunctionOp()
          .functions()[0]
          .auth()[0]
          .rootInvocation()
          .functionName()
          .toString()
      ).to.equal("fn");

      expect(
        SorobanClient.StrKey.encodeEd25519PublicKey(
          result
            .toEnvelope()
            .v1()
            .tx()
            .operations()[0]
            .body()
            .invokeHostFunctionOp()
            .functions()[0]
            .auth()[0]
            .addressWithNonce()
            .address()
            .accountId()
            .ed25519()
        )
      ).to.equal("GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI");
    });

    it("simulate ignores non auth from simulation", () => {
      const txn = singleContractFnTransaction();
      let simulateResp = JSON.parse(JSON.stringify(simulationResponse));
      simulateResp.results[0].auth = null;
      const result = SorobanClient.assembleTransaction(
        txn,
        networkPassphrase,
        simulateResp
      );

      expect(
        result
          .toEnvelope()
          .v1()
          .tx()
          .operations()[0]
          .body()
          .invokeHostFunctionOp()
          .functions()[0]
          .auth()
      ).to.have.length(0);
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
          })
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
          "Error: unsupported operation type, must be only one InvokeHostFunctionOp in the transaction."
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
              new SorobanClient.xdr.HostFunction({
                args: new SorobanClient.xdr.HostFunctionArgs.hostFunctionTypeInvokeContract(
                  []
                ),
                auth: [],
              }),
              new SorobanClient.xdr.HostFunction({
                args: new SorobanClient.xdr.HostFunctionArgs.hostFunctionTypeInvokeContract(
                  []
                ),
                auth: [],
              }),
            ],
          })
        )
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();

      try {
        SorobanClient.assembleTransaction(
          txn,
          networkPassphrase,
          simulationResponse
        );
        expect.fail();
      } catch (err) {
        expect(err.toString()).to.equal(
          "Error: preflight simulation results do not contain same count of HostFunctions that InvokeHostFunctionOp in the transaction has."
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
          })
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
          .v1()
          .tx()
          .operations()[0]
          .body()
          .invokeHostFunctionOp()
          .functions()
      ).to.have.length(0);
    });
  });
});
