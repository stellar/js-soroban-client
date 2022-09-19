const MockAdapter = require('axios-mock-adapter');

xdescribe('Server#fetchTimebounds', function() {
  beforeEach(function() {
    this.server = new SorobanSdk.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  let clock;

  beforeEach(function() {
    // set now to 10050 seconds
    clock = sinon.useFakeTimers(10050 * 1000);
    // use MockAdapter instead of this.axiosMock
    // because we don't want to replace the get function
    // we need to use axios's one so interceptors run!!
    this.axiosMockAdapter = new MockAdapter(AxiosClient);
  });

  afterEach(function() {
    clock.restore();
    this.axiosMockAdapter.restore();
  });

  // the next two tests are run in a deliberate order!!
  // don't change the order!!
  it('fetches falls back to local time if fetch is bad', function(done) {
    this.axiosMockAdapter
      .onGet(serverUrl)
      .reply(200, {}, {});

    this.server
      .fetchTimebounds(20)
      .then((serverTime) => {
        expect(serverTime).to.eql({ minTime: 0, maxTime: 10070 });
        done();
      })
      .catch((e) => {
        done(e);
      });
  });

  it('fetches if nothing is recorded', function(done) {
    this.axiosMockAdapter
      .onGet(serverUrl)
      .reply(
        200,
        {},
        {
          date: 'Wed, 13 Mar 2019 22:15:07 GMT'
        }
      );

    this.server
      .fetchTimebounds(20)
      .then((serverTime) => {
        expect(serverTime).to.eql({
          minTime: 0,
          // this is server time 1552515307 plus 20
          maxTime: 1552515327
        });

        done();
      })
      .catch((e) => {
        done(e);
      });
  });
});
