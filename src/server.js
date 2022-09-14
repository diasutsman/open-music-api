require('dotenv').config()
const Hapi = require('@hapi/hapi');
const AlbumsService = require('./services/postgres/AlbumsService');

// Plugins
const albums = require('./api/albums/index')
const songs = require('./api/songs/index');
const SongsService = require('./services/postgres/SongsService');

// Validators
const AlbumsValidator = require("./validator/albums/index");
const SongsValidator = require("./validator/songs/index");

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

    const albumsService = new AlbumsService()
    const songsService = new SongsService()

    await server.register(
        [
            {
                plugin: albums,
                options: {
                    service: albumsService,
                    validator: AlbumsValidator
                }
            },
            {
                plugin: songs,
                options: {
                    service: songsService,
                    validator: SongsValidator
                }
            }
        ]
    )

    await server.start();
    console.log('Server running on %s', server.info.uri);
}

init()