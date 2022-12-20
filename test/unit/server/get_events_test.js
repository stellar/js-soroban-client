import * as fs from 'fs';

const MockAdapter = require('axios-mock-adapter');

describe('Server#getEvents', function() {
  beforeEach(function() {
    this.server = new SorobanClient.Server(serverUrl);
    this.axiosMock = sinon.mock(AxiosClient);
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  it('requests the correct endpoint', function(done) {
    let result = { events: [] };

    this.axiosMock
      .expects('post')
      .withArgs(
        serverUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getEvents',
          params: [{
            endLedger: 2,
            filters: [],
            pagination: {},
            startLedger: 1,
          }],
        }
      )
      .returns(Promise.resolve({ data: { result } }));

    this.server
      .getEvents(1, 2)
      .then(function(response) {
        expect(response).to.be.deep.equal(result);
        done();
      })
      .catch(function(err) {
        done(err);
      });
  });

  xit('builds the correct filters', function(done) {
    let path = "test/unit/server/fixtures"; // boldly assumes project root
    let result = JSON.parse(fs.readFileSync(`${path}/get-events.json`));

    get_events(result, "*/")

    done();
  })
});

function getEvents(events, filter) {
  return events.filter((e, i) => (
    e.topic.length == filter.length &&
    e.topic.every((s, j) => (s === filter[j] || s === "*"))
  ));
}