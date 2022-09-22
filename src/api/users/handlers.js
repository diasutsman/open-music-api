/**
 * Import necessary modules
 * @typedef { import('@hapi/hapi') } Hapi
 * @typedef { import('@hapi/jwt') } Jwt
 * @typedef { import('@hapi/hapi').Request } Hapi.Request
 * @typedef { import('@hapi/hapi').ResponseToolkit } Hapi.ResponseToolkit
 * @typedef { import('@hapi/hapi').ResponseObject } Hapi.ResponseObject
 *
 * @typedef { import('../../services/postgres/UsersService') } UsersService
 * @typedef { import('../../validator/users/index') } UsersValidator
 */

const autoBind = require('auto-bind');

/**
 * Handler for users route
 */
class UsersHandler {
  /**
   * UsersHandler constructor
   * @param {UsersService} service
   * @param {UsersValidator} validator
   */
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  /**
   * Handler for post user route
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);

    const {username, password, fullname} = request.payload;

    const userId = await this._service.addUser({username, password, fullname});

    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
