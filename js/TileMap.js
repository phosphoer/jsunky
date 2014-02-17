(function (TomatoJS, $, undefined)
{

TomatoJS.TileMap = function()
{
  this.tiles = [];
  this.zdepth = -1;
  this.tile_size = 16;
  this.wrap = false;
  this.layer = 0;
  this.width = 0;
  this.height = 0;
  this.tilesetPath = "";
  this.tileset = null;
}

TomatoJS.TileMap.prototype.Load = function(data)
{
  this.zdepth = data.zdepth;
  this.tile_size = data.tile_size;
  this.width = data.width;
  this.height = data.height;
  this.wrap = data.wrap;
  this.tiles = [];

  for (var i in data.tiles)
  {
    var attr = i;

    var tiles = data.tiles[i].split(" ");

    var x = 0;
    var y = 0;
    for (var j = 0; j < data.tiles[i].length; ++j)
    {
      var num = parseInt(tiles[j]);
      ++j;
      var val = parseInt(tiles[j]);
      for (var n = 0; n < num; ++n)
      {
        this.SetTile(x, y, attr, val);
        ++y;

        if (y >= this.height)
        {
          ++x;
          y = 0;
        }
      }
    }
  }
}

TomatoJS.TileMap.prototype.Save = function()
{
  var data = {};
  data.zdepth = this.zdepth;
  data.tile_size = this.tile_size;
  data.wrap = this.wrap;
  data.width = this.width;
  data.height = this.height;
  data.tileset = this.tilesetPath;
  data.tiles = {};

  var attrs = [this.ImageAttr, this.CollisionAttr, this.ObjectAttr];

  for (var i in attrs)
  {
    var attr = attrs[i];
    data.tiles[attr] = "";

    var currentVal = "none";
    var valCount = 0;
    for (var x = 0; x < this.width; ++x)
    {
      for (var y = 0; y < this.height; ++y)
      {
        var val = -1;
        if (this.tiles[x] && this.tiles[x][y] && this.tiles[x][y][attr] != undefined)
          val = this.tiles[x][y][attr];

        if (currentVal != val && currentVal != "none")
        {
          data.tiles[attr] += valCount + " ";
          data.tiles[attr] += currentVal + " ";
          currentVal = val;
          valCount = 1;
        }
        else if (x == this.width - 1 && y == this.height - 1)
        {
          ++valCount;
          data.tiles[attr] += valCount + " ";
          data.tiles[attr] += currentVal + " ";
        }
        else
        {
          currentVal = val;
          ++valCount;
        }
      }
    }
  }

  return data;
}

TomatoJS.TileMap.prototype.SetTile = function(x, y, attr, value)
{
  x = Math.floor(x);
  y = Math.floor(y);

  if (!this.tiles[x])
    this.tiles[x] = [];

  if (!this.tiles[x][y])
    this.tiles[x][y] = {};

  if (value != null)
  {
    this.tiles[x][y][attr] = value;
    this.width = Math.max(this.width, x + 1);
    this.height = Math.max(this.height, y + 1);
  }
  else
    delete this.tiles[x][y][attr];
}

TomatoJS.TileMap.prototype.SetTileInWorld = function(x, y, attr, value)
{
  x = Math.floor(x / this.tile_size);
  y = Math.floor(y / this.tile_size);

  if (!this.tiles[x])
    this.tiles[x] = [];

  if (!this.tiles[x][y])
    this.tiles[x][y] = {};

  if (value != null)
  {
    this.tiles[x][y][attr] = value;
    this.width = Math.max(this.width, x + 1);
    this.height = Math.max(this.height, y + 1);
  }
  else
    delete this.tiles[x][y][attr];
}

TomatoJS.TileMap.prototype.GetTile = function(x, y, attr)
{
  x = Math.floor(x);
  y = Math.floor(y);

  if (!this.tiles[x])
    return null;

  if (!this.tiles[x][y])
    return null;

  var val = this.tiles[x][y][attr];
  if (!val)
    return null;

  return val;
}

TomatoJS.TileMap.prototype.GetTileInWorld = function(x, y, attr)
{
  x = Math.floor(x / this.tile_size);
  y = Math.floor(y / this.tile_size);

  if (!this.tiles[x])
    return null;

  if (!this.tiles[x][y])
    return null;

  var val = this.tiles[x][y][attr];
  if (!val)
    return null;

  return val;
}

TomatoJS.TileMap.prototype.ClearObjects = function()
{
  for (var x in this.tiles)
  {
    for (var y in this.tiles[x])
    {
      delete this.tiles[x][y][this.ObjectAttr];
    }
  }
}

TomatoJS.TileMap.prototype.SetTileset = function(tilesetName)
{
  this.tilesetPath = tilesetName;
  this.tileset = TomatoJS.Core.resourceManager.GetTileset(tilesetName);
}

TomatoJS.TileMap.prototype.Draw = function(dt, context, camera)
{
  // Lazy get of our tileset
  if (!this.tileset && this.tilesetPath != "")
    this.tileset = TomatoJS.Core.resourceManager.GetTileset(tilesetName);

  var beginX = Math.ceil(camera.x / this.tile_size);
  var endX = Math.ceil((camera.x + TomatoJS.Core.canvas.width) / this.tile_size);
  var beginY = Math.ceil(camera.y / this.tile_size);
  var endY = Math.ceil((camera.y + TomatoJS.Core.canvas.height) / this.tile_size);

  if (TomatoJS.Core.editorEnabled)
    context.fillStyle = "rgba(255, 0, 0, 0.3)";

  for (var x = beginX - 1; x < endX; ++x)
  {
    if (!this.wrap && (x < 0 || x >= this.width || !this.tiles[x]))
      continue;

    for (var y = beginY - 1; y < endY; ++y)
    {
      if (!this.wrap && (y < 0 || y >= this.height || !this.tiles[x][y]))
        continue;

      var tileX = x;
      var tileY = y;
      while (tileX < 0) tileX += this.width;
      while (tileY < 0) tileY += this.height;
      while (tileX >= this.width) tileX -= this.width;
      while (tileY >= this.height) tileY -= this.height;

      if (!this.tiles[tileX] || !this.tiles[tileX][tileY])
        continue;

      // Draw image
      var img = this.tiles[tileX][tileY][this.ImageAttr];
      if (img >= 0)
        this.tileset.DrawTileAtPosition(context, img, x * this.tile_size - camera.x, y * this.tile_size - camera.y);

      // Draw debug collision info
      if (TomatoJS.Core.editorEnabled)
      {
        var col = this.tiles[tileX][tileY][this.CollisionAttr];
        var xpos = x * this.tile_size * TomatoJS.CoreScale - camera.x * TomatoJS.CoreScale;
        var ypos = y * this.tile_size * TomatoJS.CoreScale - camera.y * TomatoJS.CoreScale;
        if (col == this.SolidTile)
          context.fillRect(xpos, ypos, this.tile_size * TomatoJS.CoreScale, this.tile_size * TomatoJS.CoreScale);
      }
    }
  }
}

TomatoJS.TileMap.prototype.ImageAttr = "image";
TomatoJS.TileMap.prototype.CollisionAttr = "collision";
TomatoJS.TileMap.prototype.ObjectAttr = "objects";

// TomatoJS.TileMap.prototype.Attr = {};
// TomatoJS.TileMap.prototype.Attr.Image = "image";
// TomatoJS.TileMap.prototype.Attr.Collision = "collision";
// TomatoJS.TileMap.prototype.Attr.Object = "objects";

TomatoJS.TileMap.prototype.EmptyTile = 0;
TomatoJS.TileMap.prototype.SolidTile = 1;

} (window.TomatoJS = window.TomatoJS || {}, jQuery));