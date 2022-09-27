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

const mapAlbumsDBtoModel = ({
  id,
  name,
  year,
  cover: coverUrl = null,
}) => ({
  id,
  name,
  year,
  coverUrl,
})

module.exports = {mapSongsDBtoModel, mapAlbumsDBtoModel};
