const { xdr, nativeToScVal, Durability, hash } = SorobanClient;

describe('Server#getContractData', function () {
  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  const address = 'CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5';
  const key = nativeToScVal(['Admin']);

  const ledgerEntry = xdr.LedgerEntryData.contractData(
    new xdr.ContractDataEntry({
      ext: new xdr.ExtensionPoint(0),
      contract: new SorobanClient.Address(address).toScAddress(),
      durability: xdr.ContractDataDurability.persistent(),
      key,
      val: key // lazy
    })
  );

  // the key is a subset of the val
  const ledgerKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: ledgerEntry.contractData().contract(),
      durability: ledgerEntry.contractData().durability(),
      key: ledgerEntry.contractData().key()
    })
  );

  const ledgerExpirationKey = xdr.LedgerKey.expiration(
    new xdr.LedgerKeyExpiration({ keyHash: hash(ledgerKey.toXDR()) })
  );

  const ledgerExpirationEntry = xdr.LedgerEntryData.expiration(
    new xdr.ExpirationEntry({
      keyHash: hash(ledgerKey.toXDR()),
      expirationLedgerSeq: 1000
    })
  );

  it('contract data key found', function (done) {
    let result = {
      lastModifiedLedgerSeq: 1,
      key: ledgerKey,
      val: ledgerEntry,
      expiration: ledgerExpirationEntry
    };

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [
          [ledgerKey.toXDR('base64'), ledgerExpirationKey.toXDR('base64')]
        ]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 420,
              entries: [
                {
                  lastModifiedLedgerSeq: result.lastModifiedLedgerSeq,
                  key: ledgerKey.toXDR('base64'),
                  xdr: ledgerEntry.toXDR('base64')
                },
                {
                  lastModifiedLedgerSeq: result.lastModifiedLedgerSeq,
                  key: ledgerExpirationKey.toXDR('base64'),
                  xdr: ledgerExpirationEntry.toXDR('base64')
                }
              ]
            }
          }
        })
      );

    this.server
      .getContractData(address, key, Durability.Persistent)
      .then(function (response) {
        expect(response.key.toXDR('base64')).to.be.deep.equal(
          result.key.toXDR('base64')
        );
        expect(response.val.toXDR('base64')).to.be.deep.equal(
          result.val.toXDR('base64')
        );
        expect(response.expiration.toXDR('base64')).to.be.deep.equal(
          result.expiration.expiration().toXDR('base64')
        );
        done();
      })
      .catch((err) => done(err));
  });

  it('expiration entry not present for contract data key in server response', function (done) {
    let result = {
      lastModifiedLedgerSeq: 1,
      key: ledgerKey,
      val: ledgerEntry
    };

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [
          [ledgerKey.toXDR('base64'), ledgerExpirationKey.toXDR('base64')]
        ]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 420,
              entries: [
                {
                  lastModifiedLedgerSeq: result.lastModifiedLedgerSeq,
                  key: result.key.toXDR('base64'),
                  xdr: result.val.toXDR('base64')
                }
              ]
            }
          }
        })
      );

    this.server
      .getContractData(address, key, Durability.Persistent)
      .then(function (response) {
        expect(response.key.toXDR('base64')).to.be.deep.equal(
          result.key.toXDR('base64')
        );
        expect(response.val.toXDR('base64')).to.be.deep.equal(
          result.val.toXDR('base64')
        );
        expect(response.expiration).to.be.undefined;
        done();
      })
      .catch((err) => done(err));
  });

  it('contract data key not found', function (done) {
    // clone and change durability to test this case
    const ledgerKeyDupe = xdr.LedgerKey.fromXDR(ledgerKey.toXDR());
    ledgerKeyDupe
      .contractData()
      .durability(xdr.ContractDataDurability.temporary());

    const ledgerExpirationKeyDupe = xdr.LedgerKey.expiration(
      new xdr.LedgerKeyExpiration({ keyHash: hash(ledgerKeyDupe.toXDR()) })
    );

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [
          [
            ledgerKeyDupe.toXDR('base64'),
            ledgerExpirationKeyDupe.toXDR('base64')
          ]
        ]
      })
      .returns(Promise.resolve({ data: { result: { entries: [] } } }));

    this.server
      .getContractData(address, key, Durability.Temporary)
      .then(function (_response) {
        done(new Error('Expected error'));
      })
      .catch(function (err) {
        done(
          err.code == 404
            ? null
            : new Error('Expected error code 404, got: ' + err.code)
        );
      });
  });

  it('fails on hex address (was deprecated now unsupported)', function (done) {
    let hexAddress = '0'.repeat(63) + '1';
    this.server
      .getContractData(hexAddress, key, Durability.Persistent)
      .then((reply) => done(new Error(`should fail, got: ${reply}`)))
      .catch((error) => {
        expect(error).to.contain(/unsupported contract id/i);
        done();
      });
  });
});
