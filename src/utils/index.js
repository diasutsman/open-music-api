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

const autoBind = (self) =>
  Object.getOwnPropertyNames(Object.getPrototypeOf(self))
      .forEach((prop) => self[prop] = self[prop].bind(self));

module.exports = {mapSongsDBtoModel, autoBind};
