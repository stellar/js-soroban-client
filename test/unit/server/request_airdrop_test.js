const MockAdapter = require('axios-mock-adapter');

describe('Server#requestAirdrop', function() {
  const { Account, StrKey, xdr } = SorobanClient;

  beforeEach(function() {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  function mockGetNetwork(friendbotUrl) {
    const result = {
      friendbotUrl,
      passphrase: 'Soroban Testnet ; December 2018',
      protocolVersion: 20,
    };
    this.axiosMock
      .expects('post')
      .withArgs(
        serverUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getNetwork',
          params: [],
        }
      )
      .returns(Promise.resolve({ data: { result } }));
  }

  it('returns true when the account is created', function(done) {
    const friendbotUrl = 'https://friendbot.stellar.org';
    const accountId = 'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI';
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects('post')
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { successful: true } }));

    this.server
      .requestAirdrop(accountId)
      .then(function(response) {
        expect(response).to.be.deep.equal(new Account(accountId, '1'));
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('returns false if the account already exists', function(done) {
    const friendbotUrl = 'https://friendbot.stellar.org';
    const accountId = 'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI';
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects('post')
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.reject({ response: { status: 400 } }));

    this.axiosMock
      .expects('post')
      .withArgs(
        serverUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getLedgerEntry',
          params: [
            xdr.LedgerKey.account(
              new xdr.LedgerKeyAccount({
                accountId: xdr.PublicKey.publicKeyTypeEd25519(
                  StrKey.decodeEd25519PublicKey(accountId),
                ),
              }),
            ).toXDR("base64")
          ],
        }
      )
      .returns(Promise.resolve({ data: { result: {
        xdr: "AAAAAAAAAABzdv3ojkzWHMD7KUoXhrPx0GH18vHKV0ZfqpMiEblG1g3gtpoE608YAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAQAAAAAY9D8iA",
      }}}));

    this.server
      .requestAirdrop(accountId)
      .then(function(response) {
        expect(response).to.be.deep.equal(new Account(accountId, '1'));
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('uses custom friendbotUrl if passed', function(done) {
    const friendbotUrl = 'https://custom-friendbot.stellar.org';
    const accountId = 'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI';

    this.axiosMock
      .expects('post')
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { successful: true } }));

    this.server
      .requestAirdrop(accountId, friendbotUrl)
      .then(function(response) {
        expect(response).to.be.deep.equal(new Account(accountId, '1'));
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('encodes the address to avoid any injection', function(done) {
    const friendbotUrl = 'https://friendbot.stellar.org';
    const accountId = "addr&injected=1";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects('post')
      .withArgs(`${friendbotUrl}?addr=addr%26injected%3D1`)
      .returns(Promise.resolve({ data: { successful: true } }));

    this.server
      .requestAirdrop(accountId)
      .then(function(_) {
        done(new Error("Should have thrown"));
      })
      .catch(function(err) {
        expect(err.message).to.be.equal("accountId is invalid");
        done();
      });
  });


  it('throws if there is no friendbotUrl set', function(done) {
    const accountId = "addr&injected=1";
    mockGetNetwork.call(this, undefined);

    this.server
      .requestAirdrop(accountId)
      .then(function(_) {
        done(new Error("Should have thrown"));
      })
      .catch(function(err) {
        expect(err.message).to.be.equal("No friendbot URL configured for current network");
        done();
      });
  });

  it('throws if the request fails', function(done) {
    const friendbotUrl = 'https://friendbot.stellar.org';
    const accountId = 'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI';
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects('post')
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.reject(new Error("Request failed")));

    this.server
      .requestAirdrop(accountId)
      .then(function(_) {
        done(new Error("Should have thrown"));
      })
      .catch(function(err) {
        expect(err.message).to.be.equal("Request failed");
        done();
      });
  });
});
