const { xdr } = SorobanClient;

describe('Server#sendTransaction', function () {
  let keypair = SorobanClient.Keypair.random();
  let account = new SorobanClient.Account(
    keypair.publicKey(),
    '56199647068161'
  );

  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
    let transaction = new SorobanClient.TransactionBuilder(account, {
      fee: 100,
      networkPassphrase: SorobanClient.Networks.TESTNET,
      v1: true
    })
      .addOperation(
        SorobanClient.Operation.payment({
          destination:
            'GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW',
          asset: SorobanClient.Asset.native(),
          amount: '100.50'
        })
      )
      .setTimeout(SorobanClient.TimeoutInfinite)
      .build();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.hash = this.transaction.hash().toString('hex');
    this.blob = transaction.toEnvelope().toXDR().toString('base64');
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it('sends a transaction', function (done) {
    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [this.blob]
      })
      .returns(
        Promise.resolve({
          data: { id: 1, result: { id: this.hash, status: 'PENDING' } }
        })
      );

    this.server
      .sendTransaction(this.transaction)
      .then(function () {
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('encodes the error result', function (done) {
    const txResult = new xdr.TransactionResult({
      feeCharged: new xdr.Int64(1),
      result: xdr.TransactionResultResult.txSorobanInvalid(),
      ext: new xdr.TransactionResultExt(0)
    });

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [this.blob]
      })
      .returns(
        Promise.resolve({
          data: {
            id: 1,
            result: {
              id: this.hash,
              status: 'ERROR',
              errorResultXdr: txResult.toXDR('base64')
            }
          }
        })
      );

    this.server
      .sendTransaction(this.transaction)
      .then(function (r) {
        expect(r.errorResult).to.be.instanceOf(xdr.TransactionResult);
        expect(r.errorResult).to.eql(txResult);
        expect(r.errorResultXdr).to.be.undefined;

        done();
      })
      .catch(done);
  });

  xit('adds metadata - tx was too small and was immediately deleted');
  xit('adds metadata, order immediately fills');
  xit('adds metadata, order is open');
  xit('adds metadata, partial fill');
  xit('doesnt add metadata to non-offers');
  xit('adds metadata about offers, even if some ops are not');
  xit('submits fee bump transactions');
});
