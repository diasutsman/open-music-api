const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

// Make the authentication plugin
module.exports = {
    name: 'authentications',
    version: '1.0.0',
    async register(server, {
        authenticationsService, usersService, tokenManager, validator,
    }) {
        const authenticationsHandler = new AuthenticationsHandler(
            authenticationsService,
            usersService,
            tokenManager,
            validator,
        );

        server.route(routes(authenticationsHandler));
    },
};
