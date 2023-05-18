describe("Server#simulateTransaction", function () {
  let keypair = SorobanClient.Keypair.random();
  let account = new SorobanClient.Account(
    keypair.publicKey(),
    "56199647068161"
  );

  const simulationResponse = {
    transactionData: new SorobanClient.xdr.SorobanTransactionData({
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
    }).toXDR("base64"),
    events: [],
    minResourceFee: "15",
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
    cost: {
      cpuInsns: "0",
      memBytes: "0",
    },
  };

  beforeEach(function() {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
    const source = new SorobanClient.Account(
      "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
      "1",
    );
    function emptyContractTransaction() {
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

    const transaction = emptyContractTransaction();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.hash = this.transaction.hash().toString("hex");
    this.blob = transaction.toEnvelope().toXDR().toString("base64");
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("simulates a transaction", function(done) {
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "simulateTransaction",
        params: [this.blob],
      })
      .returns(
        Promise.resolve({ data: { id: 1, result: simulationResponse } }),
      );

    this.server
      .simulateTransaction(this.transaction)
      .then(function(response) {
        expect(response).to.be.deep.equal(simulationResponse);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });
  xit("adds metadata - tx was too small and was immediately deleted");
  xit("adds metadata, order immediately fills");
  xit("adds metadata, order is open");
  xit("adds metadata, partial fill");
  xit("doesnt add metadata to non-offers");
  xit("adds metadata about offers, even if some ops are not");
  xit("simulates fee bump transactions");
});
