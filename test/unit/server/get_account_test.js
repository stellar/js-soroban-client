const MockAdapter = require("axios-mock-adapter");

describe("Server#getAccount", function() {
  beforeEach(function() {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it("requests the correct method", function(done) {
    let address = "GBS43BF24ENNS3KPACUZVKK2VYPOZVBQO2CISGZ777RYGOPYC2FT6S3K";
    let result = {
      id: address,
      sequence: "1",
    };

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getAccount",
        params: [address],
      })
      .returns(Promise.resolve({ data: { result } }));

    this.server
      .getAccount(address)
      .then(function(response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });
});
