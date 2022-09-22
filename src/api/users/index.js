const UsersHandler = require('./handlers');
const routes = require('./routes');

module.exports = {
  name: 'users',
  version: '1.0.0',
  async register(server, {service, validator}) {
    const usersHandler = new UsersHandler(service, validator);
    server.route(routes(usersHandler));
  },
};
