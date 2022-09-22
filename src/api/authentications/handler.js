/**
 * Import necessary modules
 * @typedef { import('@hapi/hapi') } Hapi
 * @typedef { import('@hapi/jwt') } Jwt
 * @typedef { import('@hapi/hapi').Request } Hapi.Request
 * @typedef { import('@hapi/hapi').ResponseToolkit } Hapi.ResponseToolkit
 * @typedef { import('@hapi/hapi').ResponseObject } Hapi.ResponseObject
 *
 * @typedef {
 *    import('../../services/postgres/AuthenticationsService')
 * } AuthenticationsService
 * @typedef { import('../../services/postgres/UsersService') } UsersService
 * @typedef {
 *    import('../../validator/authentications/index')
 * } AuthenticationsValidator
 */


/**
 * Authentication handler that will be used to authenticate user
 */
class AuthenticationsHandler {
  /**
   * Handler for authentications constructor
   *
   * @param {AuthenticationsService} authService
   * @param {UsersService} usersService
   * @param {TokenManager} tokenManager
   * @param {AuthenticationsValidator} validator
   */
  constructor(authService, usersService, tokenManager, validator) {
    this._authService = authService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.deleteAuthHandler = this.deleteAuthHandler.bind(this);
    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
  }

  /**
   * Handle post authentication to generate access token
   *
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async postAuthenticationHandler(request, h) {
    // Validate payload
    this._validator.validatePostAuthenticationPayload(request.payload);

    const {username, password} = request.payload;

    // Verify credential
    const id =
      await this._usersService.verifyUserCredential(username, password);

    // Generate access token and refresh token
    const accessToken = this._tokenManager.generateAccessToken({id});
    const refreshToken = this._tokenManager.generateRefreshToken({id});

    // Add refresh token to database
    await this._authService.addRefreshToken(refreshToken);

    // Return response with access token and refresh token
    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan.',
      data: {
        accessToken,
        refreshToken,
      },
    });

    response.code(201);

    return response;
  }

  /**
   * Handle put authentication to refresh access token
   *
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async putAuthenticationHandler(request, h) {
    // Validate payload
    this._validator.validatePutAuthenticationPayload(request.payload);

    // Retrieve the access token from payload
    const {refreshToken} = request.payload;

    // Verify refreshToken both in terms of database and token signature
    await this._authService.verifyRefreshToken(refreshToken);
    const {id} = this._tokenManager.verifyRefreshToken(refreshToken);

    // Regenerate new accessToken with the id payload from refreshToken
    const accessToken = this._tokenManager.generateAccessToken({id});

    // Return the response with accessToken
    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  }

  /**
   * Handle delete authentication to delete refresh token
   * @param {Hapi.Request} request
   * @param {Hapi.ResponseToolkit} h
   * @return {Hapi.ResponseObject}
   */
  async deleteAuthHandler(request, h) {
    // Validate payload
    this._validator.validateDeleteAuthenticationPayload(request.payload);

    // Retrieve the access token from payload
    const {refreshToken} = request.payload;

    // Check if the refresh token is exist in database
    await this._authService.verifyRefreshToken(refreshToken);

    // Delete the refresh token from database
    await this._authService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
