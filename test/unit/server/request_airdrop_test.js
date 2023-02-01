const MockAdapter = require('axios-mock-adapter');

describe('Server#requestAirdrop', function() {
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
    const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects('post')
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { successful: true } }));

    this.server
      .requestAirdrop(accountId)
      .then(function(response) {
        expect(response).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('returns false if the account already exists', function(done) {
    const friendbotUrl = 'https://friendbot.stellar.org';
    const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
    mockGetNetwork.call(this, friendbotUrl);

    this.axiosMock
      .expects('post')
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { successful: false } }));

    this.server
      .requestAirdrop(accountId)
      .then(function(response) {
        expect(response).to.be.equal(false);
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  it('uses custom friendbotUrl if passed', function(done) {
    const friendbotUrl = 'https://custom-friendbot.stellar.org';
    const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";

    this.axiosMock
      .expects('post')
      .withArgs(`${friendbotUrl}?addr=${accountId}`)
      .returns(Promise.resolve({ data: { successful: true } }));

    this.server
      .requestAirdrop(accountId, friendbotUrl)
      .then(function(response) {
        expect(response).to.be.equal(true);
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
      .then(function(response) {
        expect(response).to.be.equal(true);
        done();
      })
      .catch(function(err) {
        done(err);
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

  it('throws if there the request fails', function(done) {
    const friendbotUrl = 'https://friendbot.stellar.org';
    const accountId = "GBZC6Y2Y7Q3ZQ2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4QZJ2XZ3Z5YXZ6Z7Z2Y4";
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
