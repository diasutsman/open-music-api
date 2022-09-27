const InvariantError = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema, ImageHeadersSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumsPayload(payload) {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateImageHeaders(header) {
    const validationResult = ImageHeadersSchema.validate(header)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error)
    }
  }
};

module.exports = AlbumsValidator;
