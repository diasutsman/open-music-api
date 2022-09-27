const routes = (handler) => [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: handler.postExportPlaylistByIdHandler,
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
];

module.exports = routes;
