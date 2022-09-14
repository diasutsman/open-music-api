const mapSongsDBtoModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration = null,
  album_id: albumId = null,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId,
});

const serverErrorResponse = (error, h) => {
  // Server ERROR!
  const response = h.response({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami',
  });
  response.code(500);
  // eslint-disable-next-line no-console
  console.error(error);
  return response;
};

const clientErrorResponse = (error, h) => {
  const response = h.response({
    status: 'fail',
    message: error.message,
  });
  response.code(error.code);
  return response;
};

module.exports = {mapSongsDBtoModel, serverErrorResponse, clientErrorResponse};
