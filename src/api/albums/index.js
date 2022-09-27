const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  async register(server, {albumsService, storageService, validator}) {
    const albumsHandler = new AlbumsHandler(albumsService, storageService, validator);
    server.route(routes(albumsHandler));
  },
};
