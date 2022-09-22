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

module.exports = {mapSongsDBtoModel};
