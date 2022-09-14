const SongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',

  /**
     * Must have register function with server
     * and server options as its parameter
     * @param {Hapi.Server} server
     * @param {{service: AlbumsService, validator: AlbumsValidator}} options
     */
  async register(server, {service, validator}) {
    const songsHandler = new SongsHandler(service, validator);
    server.route(routes(songsHandler));
  },
};
