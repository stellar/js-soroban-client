const { xdr, Keypair, Account, SorobanDataBuilder } = SorobanClient;

describe('Server#simulateTransaction', function () {
  let keypair = Keypair.random();

  let contractId = 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM';
  let contract = new SorobanClient.Contract(contractId);
  let address = contract.address().toScAddress();

  const simulationResponse = {
    id: 1,
    events: [],
    latestLedger: 3,
    minResourceFee: '15',
    transactionData: new SorobanDataBuilder().build().toXDR('base64'),
    results: [
      {
        auth: [
          new xdr.SorobanAuthorizationEntry({
            // Include a credentials w/ a nonce
            credentials: new xdr.SorobanCredentials.sorobanCredentialsAddress(
              new xdr.SorobanAddressCredentials({
                address: address,
                nonce: new xdr.Int64(1234),
                signatureExpirationLedger: 1,
                signatureArgs: []
              })
            ),
            // Basic fake invocation
            rootInvocation: new xdr.SorobanAuthorizedInvocation({
              function:
                xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
                  new xdr.SorobanAuthorizedContractFunction({
                    contractAddress: address,
                    functionName: 'test',
                    args: []
                  })
                ),
              subInvocations: []
            })
          }).toXDR('base64')
        ],
        xdr: xdr.ScVal.scvU32(0).toXDR('base64')
      }
    ],
    cost: {
      cpuInsns: '0',
      memBytes: '0'
    }
  };

  const parsedSimulationResponse = {
    id: simulationResponse.id,
    events: simulationResponse.events,
    latestLedger: simulationResponse.latestLedger,
    minResourceFee: simulationResponse.minResourceFee,
    transactionData: new SorobanClient.SorobanDataBuilder(
      simulationResponse.transactionData
    ),
    result: {
      auth: simulationResponse.results[0].auth.map((entry) =>
        xdr.SorobanAuthorizationEntry.fromXDR(entry, 'base64')
      ),
      retval: xdr.ScVal.fromXDR(simulationResponse.results[0].xdr, 'base64')
    },
    cost: simulationResponse.cost
  };

  beforeEach(function () {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
    const source = new Account(
      'GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI',
      '1'
    );
    function emptyContractTransaction() {
      return new SorobanClient.TransactionBuilder(source, {
        fee: 100,
        networkPassphrase: 'Test',
        v1: true
      })
        .addOperation(
          SorobanClient.Operation.invokeHostFunction({
            func: new xdr.HostFunction.hostFunctionTypeInvokeContract([]),
            auth: []
          })
        )
        .setTimeout(SorobanClient.TimeoutInfinite)
        .build();
    }

    const transaction = emptyContractTransaction();
    transaction.sign(keypair);

    this.transaction = transaction;
    this.hash = this.transaction.hash().toString('hex');
    this.blob = transaction.toEnvelope().toXDR().toString('base64');
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it('simulates a transaction', function (done) {
    this.axiosMock
      .expects('post')
      .withArgs(serverUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'simulateTransaction',
        params: [this.blob]
      })
      .returns(
        Promise.resolve({ data: { id: 1, result: simulationResponse } })
      );

    this.server
      .simulateTransaction(this.transaction)
      .then(function (response) {
        expect(response).to.be.deep.equal(parsedSimulationResponse);
        done();
      })
      .catch(function (err) {
        done(err);
      });
  });

  it('works when there are no results', function () {
    const simResponseCopy = JSON.parse(JSON.stringify(simulationResponse));
    delete simResponseCopy.results;

    const parsedCopy = cloneSimulation(parsedSimulationResponse);
    delete parsedCopy.result;

    const parsed = SorobanClient.parseRawSimulation(simResponseCopy);
    expect(parsed).to.deep.equal(parsedCopy);
  });

  it('works with no auth', function () {
    const simResponseCopy = JSON.parse(JSON.stringify(simulationResponse));
    delete simResponseCopy.results[0].auth;

    const parsedCopy = cloneSimulation(parsedSimulationResponse);
    parsedCopy.result.auth = [];
    const parsed = SorobanClient.parseRawSimulation(simResponseCopy);

    // FIXME: This is a workaround for an xdrgen bug that does not allow you to
    // build "perfectly-equal" xdr.ExtensionPoint instances (but they will still
    // be binary-equal, so the test passes), but it should be fixed once we
    // upgrade the XDR to the final testnet version.
    parsedCopy.transactionData = parsedCopy.transactionData.build();
    parsed.transactionData = parsed.transactionData.build();

    expect(parsed).to.be.deep.equal(parsedCopy);
  });

  xit('simulates fee bump transactions');
});

function cloneSimulation(sim) {
  return {
    id: sim.id,
    events: Array.from(sim.events),
    latestLedger: sim.latestLedger,
    minResourceFee: sim.minResourceFee,
    transactionData: new SorobanClient.SorobanDataBuilder(
      sim.transactionData.build()
    ),
    result: {
      auth: sim.result.auth.map((entry) =>
        xdr.SorobanAuthorizationEntry.fromXDR(entry.toXDR())
      ),
      retval: xdr.ScVal.fromXDR(sim.result.retval.toXDR())
    },
    cost: sim.cost
  };
}
