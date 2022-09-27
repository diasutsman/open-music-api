require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

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
const users = require('./api/users/index');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users/index');

// Authentications
const authentications = require('./api/authentications/index');
const AuthenticationsService =
  require('./services/postgres/AuthenticationsService');
const AuthenticationsValidator = require('./validator/authentications/index');
const TokenManager = require('./tokenize/TokenManager');

// Playlists
const playlists = require('./api/playlists/index');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistActivitiesService =
  require('./services/postgres/PlaylistsActivitiesService');
const PlaylistsValidator = require('./validator/playlists/index');
const PlaylistSongsService =
  require('./services/postgres/PlaylistsSongsService');

// Collaborations
const collaborations = require('./api/collaborations/index');
const CollaborationsService =
  require('./services/postgres/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations/index');

// Exports
const _exports = require('./api/exports/index');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports/index');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  const playlistsSongsService = new PlaylistSongsService(songsService);
  const collaborationsService = new CollaborationsService(usersService);
  const playlistsService =
    new PlaylistsService(playlistsSongsService, collaborationsService);
  const playlistActivitiesService = new PlaylistActivitiesService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // register external plugin
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // Define the authentication strategy jwt
  server.auth.strategy('openmusicapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credential: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

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
        {
          plugin: authentications,
          options: {
            authenticationsService,
            usersService,
            tokenManager: TokenManager,
            validator: AuthenticationsValidator,
          },
        },
        {
          plugin: playlists,
          options: {
            playlistsService,
            playlistActivitiesService,
            validator: PlaylistsValidator,
          },
        },
        {
          plugin: collaborations,
          options: {
            collaborationsService,
            playlistsService,
            validator: CollaborationsValidator,
          },
        },
        {
          plugin: _exports,
          options: {
            producerService: ProducerService,
            playlistsService,
            validator: ExportsValidator,
          },
        },
      ],
  );

  // Handling error before response
  server.ext('onPreResponse', (request, h) => {
    // Get response from request
    const {response} = request;

    if (response instanceof Error) {
      // Check if response is instance of ClientError
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // mempertahankan penanganan client error oleh hapi secara native,
      // seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }

      console.log(response);

      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }

    // jika bukan error,
    // lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();
