require('dotenv').config();
const Hapi = require('@hapi/hapi');

const ClientError = require('./exceptions/ClientError');

// Albums
const albums = require('./api/albums/index');
const AlbumsValidator = require('./validator/albums/index');
const AlbumsService = require('./services/postgres/AlbumsService');

// Songs
const songs = require('./api/songs/index');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs/index');

// Users
const users = require('./api/users/index')
const UsersService = require('./services/postgres/UsersService')
const UsersValidator = require('./validator/users/index')

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService()

  await server.register(
    [
      {
        plugin: albums,
        options: {
          service: albumsService,
          validator: AlbumsValidator,
        },
      },
      {
        plugin: songs,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
    ],
  );

  // Handling error before response
  server.ext('onPreResponse', (request, h) => {
    // Get response from request
    const { response } = request;
    
    // Check if response is instance of ClientError
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.code);
      return newResponse;
    } else if (response instanceof Error) {
      // Check if response is instance of generic Error
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    return response.continue || response;
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();
