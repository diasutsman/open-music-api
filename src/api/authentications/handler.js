class AuthenticationsHandler {

    constructor(authenticationsService, usersService, tokenManager, validator) {
        this.authenticationsService = authenticationsService;
        this.usersService = usersService;
        this.tokenManager = tokenManager;
        this.validator = validator;

        this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
        this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
        this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    }

    async postAuthenticationHandler(request, h) {
        // Validate payload
        this.validator.validatePostAuthenticationPayload(request.payload);

        const { username, password } = request.payload;

        // Verify credential
        const id = await this.usersService.verifyUserCredential(username, password);

        // Generate access token and refresh token
        const accessToken = this.tokenManager.generateAccessToken({ id });
        const refreshToken = this.tokenManager.generateRefreshToken({ id });

        // Add refresh token to database
        await this.authenticationsService.addRefreshToken(refreshToken);

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

    async putAuthenticationHandler(request, h) {
        // Validate payload
        this.validator.validatePutAuthenticationPayload(request.payload);

        // Retrieve the access token from payload
        const { refreshToken } = request.payload;

        // Verify refreshToken both in terms of database and token signature
        await this.authenticationsService.verifyRefreshToken(refreshToken);
        const { id } = this.tokenManager.verifyRefreshToken(refreshToken);

        // Regenerate new accessToken with the id payload from refreshToken
        const accessToken = this.tokenManager.generateAccessToken({ id });

        // Return the response with accessToken
        return {
            status: 'success',
            message: 'Access Token berhasil diperbarui',
            data: {
                accessToken,
            },
        };

    }

    async deleteAuthenticationHandler(request, h) {
        // Validate payload
        this.validator.validateDeleteAuthenticationPayload(request.payload);

        // Retrieve the access token from payload
        const { refreshToken } = request.payload;

        // Check if the refresh token is exist in database
        await this.authenticationsService.verifyRefreshToken(refreshToken);

        // Delete the refresh token from database
        await this.authenticationsService.deleteRefreshToken(refreshToken);

        return {
            status: 'success',
            message: 'Refresh token berhasil dihapus',
        };

    }
}

module.exports = AuthenticationsHandler;
