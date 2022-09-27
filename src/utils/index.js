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
});

module.exports = {mapAlbumsDBtoModel};
