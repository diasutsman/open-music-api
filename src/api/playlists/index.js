const routes = require('./routes');
const PlaylistsHandler = require('./handler');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService, playlistActivitiesService, validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
        playlistsService, playlistActivitiesService, validator,
    );
    server.route(routes(playlistsHandler));
  },
};
