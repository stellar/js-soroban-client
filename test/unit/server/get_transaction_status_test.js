describe('Server#getTransactionStatus', function() {
  let keypair = SorobanSdk.Keypair.random();
  let account = new SorobanSdk.Account(keypair.publicKey(), '56199647068161');
  
  beforeEach(function() {
    this.server = new SorobanSdk.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
    let transaction = new SorobanSdk.TransactionBuilder(account, {
      fee: 100,
      networkPassphrase: SorobanSdk.Networks.TESTNET,
      v1: true
    })
      .addOperation(
        SorobanSdk.Operation.payment({
          destination:
            'GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW',
          asset: SorobanSdk.Asset.native(),
          amount: '100.50'
        })
      )
      .setTimeout(SorobanSdk.TimeoutInfinite)
      .build();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.hash = this.transaction.hash().toString('hex');
    this.blob = transaction
      .toEnvelope()
      .toXDR()
      .toString('base64');
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });
  
  it('transaction not found', function(done) {
    this.axiosMock
      .expects('post')
      .withArgs(
        serverUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransactionStatus',
          params: [this.hash],
        }
      )
      .returns(Promise.resolve({ data: {id: 1, error: {code: 404}} }));

    this.server
      .getTransactionStatus(this.hash)
      .then(function(_response) {
        done(new Error("Expected error"));
      })
      .catch(function(err) {
        done(err.code == 404
          ? null
          : new Error("Expected error code 404, got: " + err.code)
        );
      });
  });

  xit('transaction pending', function(done) {
  });

  xit('transaction success', function(done) {
  });

  xit('transaction error', function(done) {
  });
});
