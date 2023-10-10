const { xdr, nativeToScVal, Durability, hash } = SorobanClient;

describe('Server#getLedgerEntries', function () {
  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  const address = 'CCJZ5DGASBWQXR5MPFCJXMBI333XE5U3FSJTNQU7RIKE3P5GN2K2WYD5';
  const key = nativeToScVal(['test']);

  const ledgerEntry = xdr.LedgerEntryData.contractData(
    new xdr.ContractDataEntry({
      ext: new xdr.ExtensionPoint(0),
      contract: new SorobanClient.Address(address).toScAddress(),
      durability: xdr.ContractDataDurability.persistent(),
      key,
      val: key
    })
  );

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

  it('ledger entry found, includes expiration meta', function (done) {
    let expectedResult = {
      lastModifiedLedgerSeq: 1,
      key: ledgerKey,
      val: ledgerEntry,
      expiration: ledgerExpirationEntry.expiration()
    };

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [
          [ledgerExpirationKey.toXDR('base64'), ledgerKey.toXDR('base64')]
        ]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 420,
              entries: [
                {
                  lastModifiedLedgerSeq: expectedResult.lastModifiedLedgerSeq,
                  key: ledgerKey.toXDR('base64'),
                  xdr: ledgerEntry.toXDR('base64')
                },
                {
                  lastModifiedLedgerSeq: expectedResult.lastModifiedLedgerSeq,
                  key: ledgerExpirationKey.toXDR('base64'),
                  xdr: ledgerExpirationEntry.toXDR('base64')
                }
              ]
            }
          }
        })
      );
    this.server
      .getLedgerEntries(ledgerKey)
      .then((response) => {
        expect(response.entries).to.have.lengthOf(1);
        let result = response.entries[0];
        expect(result.key.toXDR('base64')).to.be.deep.equal(
          expectedResult.key.toXDR('base64')
        );
        expect(result.val.toXDR('base64')).to.be.deep.equal(
          expectedResult.val.toXDR('base64')
        );
        expect(result.expiration.toXDR('base64')).to.be.deep.equal(
          expectedResult.expiration.toXDR('base64')
        );
        done();
      })
      .catch((err) => done(err));
  });

  it('ledger entry found, no expiration meta included in response', function (done) {
    let expectedResult = {
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
          [ledgerExpirationKey.toXDR('base64'), ledgerKey.toXDR('base64')]
        ]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 420,
              entries: [
                {
                  lastModifiedLedgerSeq: expectedResult.lastModifiedLedgerSeq,
                  key: ledgerKey.toXDR('base64'),
                  xdr: ledgerEntry.toXDR('base64')
                }
              ]
            }
          }
        })
      );
    this.server
      .getLedgerEntries(ledgerKey)
      .then((response) => {
        expect(response.entries).to.have.lengthOf(1);
        let result = response.entries[0];
        expect(result.key.toXDR('base64')).to.be.deep.equal(
          expectedResult.key.toXDR('base64')
        );
        expect(result.val.toXDR('base64')).to.be.deep.equal(
          expectedResult.val.toXDR('base64')
        );
        expect(result.expiration).to.be.undefined;

        done();
      })
      .catch((err) => done(err));
  });

  it('ledger entry found, includes expiration meta from any order in response', function (done) {
    let expectedResult = {
      lastModifiedLedgerSeq: 1,
      key: ledgerKey,
      val: ledgerEntry,
      expiration: ledgerExpirationEntry.expiration()
    };

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [
          [ledgerExpirationKey.toXDR('base64'), ledgerKey.toXDR('base64')]
        ]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 420,
              entries: [
                {
                  lastModifiedLedgerSeq: expectedResult.lastModifiedLedgerSeq,
                  key: ledgerExpirationKey.toXDR('base64'),
                  xdr: ledgerExpirationEntry.toXDR('base64')
                },
                {
                  lastModifiedLedgerSeq: expectedResult.lastModifiedLedgerSeq,
                  key: ledgerKey.toXDR('base64'),
                  xdr: ledgerEntry.toXDR('base64')
                }
              ]
            }
          }
        })
      );

    this.server
      .getLedgerEntries(ledgerKey)
      .then((response) => {
        expect(response.entries).to.have.lengthOf(1);
        let result = response.entries[0];
        expect(result.key.toXDR('base64')).to.be.deep.equal(
          expectedResult.key.toXDR('base64')
        );
        expect(result.val.toXDR('base64')).to.be.deep.equal(
          expectedResult.val.toXDR('base64')
        );
        expect(result.expiration.toXDR('base64')).to.be.deep.equal(
          expectedResult.expiration.toXDR('base64')
        );
        done();
      })
      .catch((err) => done(err));
  });

  it('ledger expiration key is requested by caller, no expiration meta needed on response', function (done) {
    let expectedResult = {
      lastModifiedLedgerSeq: 1,
      key: ledgerExpirationKey,
      val: ledgerExpirationEntry
    };

    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'getLedgerEntries',
        params: [[ledgerExpirationKey.toXDR('base64')]]
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              latestLedger: 420,
              entries: [
                {
                  lastModifiedLedgerSeq: expectedResult.lastModifiedLedgerSeq,
                  key: ledgerExpirationKey.toXDR('base64'),
                  xdr: ledgerExpirationEntry.toXDR('base64')
                }
              ]
            }
          }
        })
      );

    this.server
      .getLedgerEntries(ledgerExpirationKey)
      .then((response) => {
        expect(response.entries).to.have.lengthOf(1);
        let result = response.entries[0];
        expect(result.key.toXDR('base64')).to.be.deep.equal(
          expectedResult.key.toXDR('base64')
        );
        expect(result.val.toXDR('base64')).to.be.deep.equal(
          expectedResult.val.toXDR('base64')
        );
        expect(result.expiration).to.be.undefined;
        done();
      })
      .catch((err) => done(err));
  });
});
