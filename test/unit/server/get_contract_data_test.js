const MockAdapter = require("axios-mock-adapter");
let xdr = SorobanClient.xdr;

describe("Server#getContractData", function () {
  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  let address =
    "0000000000000000000000000000000000000000000000000000000000000001";
  let key = SorobanClient.xdr.ScVal.scvVec([
    SorobanClient.xdr.ScVal.scvSymbol("Admin"),
  ]);

  it("key found", function (done) {
    let result = {
      id: address,
      sequence: "1",
    };

    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: [
          [
            xdr.LedgerKey.contractData(
              new xdr.LedgerKeyContractData({
                contractId: Buffer.from(address, "hex"),
                key,
              }),
            ).toXDR("base64"),
          ],
        ],
      })
      .returns(
        Promise.resolve({
          data: {
            result: {
              entries: [result],
            },
          },
        }),
      );

    this.server
      .getContractData(address, key)
      .then(function (response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it("key not found", function (done) {
    this.axiosMock
      .expects("post")
      .withArgs(serverUrl, {
        jsonrpc: "2.0",
        id: 1,
        method: "getLedgerEntries",
        params: [
          [
            xdr.LedgerKey.contractData(
              new xdr.LedgerKeyContractData({
                contractId: Buffer.from(address, "hex"),
                key,
              }),
            ).toXDR("base64"),
          ],
        ],
      })
      .returns(Promise.resolve({ data: { result: { entries: [] } } }));

    this.server
      .getContractData(address, key)
      .then(function (_response) {
        done(new Error("Expected error"));
      })
      .catch(function (err) {
        done(
          err.code == 404
            ? null
            : new Error("Expected error code 404, got: " + err.code)
        );
      });
  });
});
