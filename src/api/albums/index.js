const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  async register(server, {
    albumsService, storageService, albumsLikesService, validator,
  }) {
    const albumsHandler = new AlbumsHandler(
        albumsService, storageService, albumsLikesService, validator,
    );
    server.route(routes(albumsHandler));
  },
};
