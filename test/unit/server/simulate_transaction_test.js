describe("Server#simulateTransaction", function() {
  let keypair = SorobanClient.Keypair.random();
  let account = new SorobanClient.Account(
    keypair.publicKey(),
    "56199647068161",
  );

  beforeEach(function() {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
    let transaction = new SorobanClient.TransactionBuilder(account, {
      fee: 100,
      networkPassphrase: SorobanClient.Networks.TESTNET,
      v1: true,
    })
      .addOperation(
        SorobanClient.Operation.payment({
          destination:
            "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
          asset: SorobanClient.Asset.native(),
          amount: "100.50",
        }),
      )
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.hash = this.transaction.hash().toString("hex");
    this.blob = transaction
      .toEnvelope()
      .toXDR()
      .toString("base64");
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  const result = {
    cost: {
      cpuInsns: "10000",
      memBytes: "10000",
    },
    footprint: new SorobanClient.xdr.LedgerFootprint({
      readOnly: [],
      readWrite: [],
    }).toXDR("base64"),
    results: [
      SorobanClient.xdr.ScVal.scvU32(0)
        .toXDR()
        .toString("base64"),
    ],
    latestLedger: 1,
  };

  it("simulates a transaction", function(done) {
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "simulateTransaction",
        params: [this.blob],
      })
      .returns(Promise.resolve({ data: { id: 1, result } }));

    this.server
      .simulateTransaction(this.transaction)
      .then(function(response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(function(err) {
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
