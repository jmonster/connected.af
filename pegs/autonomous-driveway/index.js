const Joi = require('joi');
const httpClient = require('superagent');

exports.isOn = function isOn(code) {

  switch(code) {
    case 5: // mixed rain and snow
    case 6: // mixed rain and sleet
    case 7: // mixed snow and slee
    case 8: // freezing drizzle
    case 10: // freezing rain
    case 13: // snow flurries
    case 14: // light snow showers
    case 15: // blowing snow
    case 16: // snow
    case 18: // sleet
    case 41: // heavy snow
    case 42: // scattered snow showers
    case 43: // heavy snow (yes, it's the same as 41)
    case 46: // snow showers
      return true;
    default:
      return false;
  }
}

exports.urlForLocation = function urlForLocation(location) {
  const state = location.state;
  const town = location.town;
  const zip = location.zip;
  const locationToQuery = (town && state) ? `${town}%20${state}` : zip;

  return `https://query.yahooapis.com/v1/public/yql?q=select%20item.condition%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text='${locationToQuery}')&format=json`;
}

exports.register = function (server, options, next) {

  server.route({
    method: 'get',
    path: '/autonomous-driveway',
    config: {
      validate:{
        query: {
          'zip': Joi.number().min(10000).max(99999),
          'state': Joi.string().length(2),
          'town': Joi.string().max(256)
        }
      }
    },
    handler: (request, reply) => {
      const url = exports.urlForLocation(request.query);

      httpClient.get(url).end(function(err, response) {
        const code = response.body.query.results.channel.item.condition.code;
        const on = exports.isOn(code)

        reply({ on });
      });
    }
  });

  next();
};

exports.register.attributes = {
  name: 'autonomous-driveway',
  version: '1'
};
