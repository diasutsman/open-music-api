const AlbumsHandler = require('./handler');
const routes = require('./routes');
const Hapi = require('@hapi/hapi')

module.exports = {
    name: 'albums',
    version: '1.0.0',

    // must have register function with server and server options as its parameter

    /**
     * 
     * @param {Hapi.Server} server 
     * @param {*} param1 
     */
    async register(server, { service, validator }) {
        const albumsHandler = new AlbumsHandler(service, validator);
        server.route(routes(albumsHandler));
    },
}