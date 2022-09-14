require('dotenv').config()
const Hapi = require('@hapi/hapi');
const albums = require('./api/albums/index')
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require("./validator/albums/index");

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

    await server.register(
        [
            {
                plugin: albums,
                options: {
                    service: albumsService,
                    validator: AlbumsValidator
                }
            }
        ]
    )

    await server.start();
    console.log('Server running on %s', server.info.uri);
}

init()