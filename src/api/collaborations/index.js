const routes = require("./routes");
const CollaborationsHandler = require("./handler");

module.exports = {
    name: 'collaborations',
    versions: '1.0.0',
    async register(server, { collaborationsService, playlistsService, validator }) {
        console.log('In plugins:', validator.validateCollaborationPayload)
        const collaborationsHandler = new CollaborationsHandler(collaborationsService, playlistsService, validator);
        server.route(routes(collaborationsHandler));
    }
}