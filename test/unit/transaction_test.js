const xdr = SorobanClient.xdr; // shorthand

describe("assembleTransaction", () => {
  describe("FeeBumpTransaction", () => {
    // TODO: Add support for fee bump transactions
  });

  const scAddress = new SorobanClient.Address(
    "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI"
  ).toScAddress();

  const fnAuth = new xdr.SorobanAuthorizationEntry({
    // Include a credentials w/ a nonce to trigger this
    credentials: new xdr.SorobanCredentials.sorobanCredentialsAddress(
      new xdr.SorobanAddressCredentials({
        address: scAddress,
        nonce: new xdr.Int64(0),
        signatureExpirationLedger: 1,
        signatureArgs: [],
      })
    ),
    // And a basic invocation
    rootInvocation: new xdr.SorobanAuthorizedInvocation({
      function:
        xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
          new xdr.SorobanAuthorizedContractFunction({
            contractAddress: scAddress,
            functionName: "fn",
            args: [],
          })
        ),
      subInvocations: [],
    }),
  });

  const sorobanTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [],
        readWrite: [],
      }),
      instructions: 0,
      readBytes: 5,
      writeBytes: 0,
      extendedMetaDataSizeBytes: 0,
    }),
    refundableFee: xdr.Int64.fromString("0"),
    ext: new xdr.ExtensionPoint(0),
  });

  const simulationResponse = {
    transactionData: sorobanTransactionData.toXDR("base64"),
    events: [],
    minResourceFee: "115",
    results: [
      {
        auth: [fnAuth.toXDR("base64")],
        xdr: xdr.ScVal.scvU32(0).toXDR().toString("base64"),
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

    function singleContractFnTransaction(auth) {
      return new SorobanClient.TransactionBuilder(source, {
        fee: 100,
        networkPassphrase: "Test",
        v1: true,
      })
        .addOperation(
          SorobanClient.Operation.invokeHostFunction({
            func: new xdr.HostFunction.hostFunctionTypeInvokeContract([]),
            auth: auth ?? [],
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
          .auth()[0]
          .rootInvocation()
          .function()
          .contractFn()
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
            .auth()[0]
            .credentials()
            .address()
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
          .auth()
      ).to.have.length(0);
    });

    it("throws for non-Soroban ops", () => {
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

      expect(() => {
        SorobanClient.assembleTransaction(txn, networkPassphrase, {
          transactionData: {},
          events: [],
          minResourceFee: "0",
          results: [],
          latestLedger: 3,
        });
        expect.fail();
      }).to.throw(/unsupported transaction/i);
    });

    it("works for all Soroban ops", function () {
      [
        SorobanClient.Operation.invokeHostFunction({
          func: xdr.HostFunction.hostFunctionTypeInvokeContract(),
        }),
        SorobanClient.Operation.bumpFootprintExpiration({
          ledgersToExpire: 27,
        }),
        SorobanClient.Operation.restoreFootprint(),
      ].forEach((op) => {
        const txn = new SorobanClient.TransactionBuilder(source, {
          fee: 100,
          networkPassphrase,
          v1: true,
        })
          .setTimeout(SorobanClient.TimeoutInfinite)
          .addOperation(op)
          .build();

        const tx = SorobanClient.assembleTransaction(
          txn,
          networkPassphrase,
          simulationResponse
        );
        expect(tx.operations[0].type).to.equal(op.body().switch().name);
      });
    });

    it("doesn't overwrite auth if it's present", function () {
      const txn = singleContractFnTransaction([ fnAuth, fnAuth, fnAuth ]);
      const tx = SorobanClient.assembleTransaction(txn, networkPassphrase, simulationResponse);

      expect(tx.operations[0].auth.length).to.equal(
        3,
        `auths aren't preserved after simulation: ${simulationResponse}, ${tx}`
      );
    });
  });
});
