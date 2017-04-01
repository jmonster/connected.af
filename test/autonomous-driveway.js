const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const Plugin = require('../pegs/autonomous-driveway/index');

const expect = Code.expect;
const lab = exports.lab = Lab.script();

const nock = require('nock');

lab.experiment('autonomous-driveway', () => {
  let server;

  lab.beforeEach((done) => {
    server = new Hapi.Server();
    server.connection({});
    server.register(Plugin, done);
  });

  lab.experiment('when provided a zip code', () => {
    lab.test('is on when snowing', (done) => {
      nock('https://query.yahooapis.com')
        .get(/.*/)
        .reply(200, {'query':{'count':1,'created':'2017-04-01T21:47:16Z','lang':'en-us','results':{'channel':{'item':{'condition':{'code':41,'date':'Sat, 01 Apr 2017 05:00 PM EDT','temp':'40','text':'heavy snow'}}}}}});

      server.inject('/autonomous-driveway?zip=96734', (response) => {
        const on = JSON.parse(response.payload).on;
        expect(on).to.equal(true);
        done();
      });
    });

    lab.test('is off when non-freezing rain', (done) => {
      nock('https://query.yahooapis.com')
        .get(/.*/)
        .reply(200, {'query':{'count':1,'created':'2017-04-01T21:47:16Z','lang':'en-us','results':{'channel':{'item':{'condition':{'code':26,'date':'Sat, 01 Apr 2017 05:00 PM EDT','temp':'40','text':'cloudy'}}}}}});

      server.inject('/autonomous-driveway?zip=96734', (response) => {
        const on = JSON.parse(response.payload).on;
        expect(on).to.equal(false);
        done();
      });
    });
  })

  lab.experiment('when provided a town and state', () => {
    lab.test('is on when snowing', (done) => {
      nock('https://query.yahooapis.com')
        .get(/.*/)
        .reply(200, {'query':{'count':1,'created':'2017-04-01T21:47:16Z','lang':'en-us','results':{'channel':{'item':{'condition':{'code':41,'date':'Sat, 01 Apr 2017 05:00 PM EDT','temp':'40','text':'heavy snow'}}}}}});

      server.inject('/autonomous-driveway?town=kailua&state=hi', (response) => {
        const on = JSON.parse(response.payload).on;
        expect(on).to.equal(true);
        done();
      });
    });

    lab.test('is off when non-freezing rain', (done) => {
      nock('https://query.yahooapis.com')
        .get(/.*/)
        .reply(200, {'query':{'count':1,'created':'2017-04-01T21:47:16Z','lang':'en-us','results':{'channel':{'item':{'condition':{'code':26,'date':'Sat, 01 Apr 2017 05:00 PM EDT','temp':'40','text':'cloudy'}}}}}});

      server.inject('/autonomous-driveway?town=kailua&state=hi', (response) => {
        const on = JSON.parse(response.payload).on;
        expect(on).to.equal(false);
        done();
      });
    });
  })
});
