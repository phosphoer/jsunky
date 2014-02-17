(function (TomatoJS, $, undefined)
{

TomatoJS.TileCollider = function(parent)
{
  this.parent = parent;
  this.width = 0;
  this.height = 0;
  this.grounded = false;
  this.staticCollision = false;
  this.wrap = false;
  this.tileLayer = 0;
  this.stopsLight = false;
  this.offsetX = 0;
  this.offsetY = 0;

  // Build corner offset array
  this.hotspots = [];
  for (var i = 0; i < 4; ++i)
    this.hotspots.push({});

  this.hotspots[0].x =  -0.5;
  this.hotspots[0].y =  -0.5;

  this.hotspots[1].x =  0.5;
  this.hotspots[1].y =  -0.5;

  this.hotspots[2].x =  0.5;
  this.hotspots[2].y =  0.5;

  this.hotspots[3].x =  -0.5;
  this.hotspots[3].y =  0.5;
}

TomatoJS.TileCollider.prototype.GetCenterPos = function()
{
  return [this.parent.x - this.offsetX, this.parent.y - this.offsetY];
  // return [this.parent.x + this.width / 2, this.parent.y + this.height / 2];
}

TomatoJS.TileCollider.prototype.GetTile = function(offsetX, offsetY, attr)
{
  var tilemap = TomatoJS.Core.GetSystem("TileSystem").GetTileMap(this.tileLayer);
  var tileX = Math.floor((this.parent.x - this.offsetX) / tilemap.tile_size) + offsetX;
  var tileY = Math.floor((this.parent.y - this.offsetY) / tilemap.tile_size) + offsetY;
  return tilemap.GetTile(tileX, tileY, attr);
}

TomatoJS.TileCollider.prototype.GetTileInWorld = function(offsetX, offsetY, attr)
{
  var tilemap = TomatoJS.Core.GetSystem("TileSystem").GetTileMap(this.tileLayer);
  var tileX = this.parent.x - this.offsetX + offsetX;
  var tileY = this.parent.y - this.offsetY + offsetY;
  return tilemap.GetTileInWorld(tileX, tileY, attr);
}

TomatoJS.TileCollider.prototype.GetCollidersInRadius = function(radius)
{
  return TomatoJS.Core.GetSystem("TileSystem").GetCollidersInRadius(this.parent.x - this.offsetX, this.parent.y - this.offsetY, radius);
}

TomatoJS.TileCollider.prototype.GetTileMap = function()
{
  return TomatoJS.Core.GetSystem("TileSystem").GetTileMap(this.tileLayer);
}

TomatoJS.TileCollider.prototype.GetInhabitedTiles = function(tilemap)
{
  var tiles = [];

  var left = Math.floor((this.parent.x - this.offsetX + this.hotspots[0].x * this.width) / tilemap.tile_size);
  var top = Math.floor((this.parent.y - this.offsetY + this.hotspots[0].y * this.height) / tilemap.tile_size);
  var right = Math.floor((this.parent.x - this.offsetX + this.hotspots[1].x * this.width) / tilemap.tile_size);
  var bottom = Math.floor((this.parent.y - this.offsetY + this.hotspots[2].y * this.height) / tilemap.tile_size);

  for (var i = left; i <= right; ++i)
    for (var j = top; j <= bottom; ++j)
      tiles.push({"x": i, "y": j});

  return tiles;
}

TomatoJS.TileCollider.prototype.RegisterTiles = function(tilemap)
{
  var tiles = this.GetInhabitedTiles(tilemap);

  for (var i in tiles)
  {
    var tile = tiles[i];
    var objects = tilemap.GetTile(tile.x, tile.y, tilemap.ObjectAttr);
    if (!objects)
    {
      objects = {};
      objects[this.parent.id] = this;
      tilemap.SetTile(tile.x, tile.y, tilemap.ObjectAttr, objects);
      continue;
    }
    objects[this.parent.id] = this;
  }
}

TomatoJS.TileCollider.prototype.CheckObjectCollision = function(tilemap)
{
  var tiles = this.GetInhabitedTiles(tilemap);

  for (var i in tiles)
  {
    var tile = tiles[i];
    var objects = tilemap.GetTile(tile.x, tile.y, tilemap.ObjectAttr);
    for (var j in objects)
    {
      var object = objects[j];
      if (object.parent.id != this.parent.id)
      {
        if (this.CollideWithObject(object))
          this.parent.Invoke("OnCollide", object.parent);
      }
    }
  }
}

TomatoJS.TileCollider.prototype.CollideWithObject = function(collider)
{
  if (this.parent.x - this.offsetX - this.width / 2 > collider.parent.x - collider.offsetX + collider.width / 2)
    return false;

   if (this.parent.y - this.offsetY - this.height / 2 > collider.parent.y - collider.offsetY + collider.height / 2)
    return false;

  if (this.parent.x - this.offsetX + this.width / 2 < collider.parent.x - collider.offsetX - collider.width / 2)
    return false;

  if (this.parent.y - this.offsetY + this.height / 2 < collider.parent.y - collider.offsetY - collider.height / 2)
    return false;

  if (collider.staticCollision && !this.staticCollision)
    this.ResolveSAT([collider.parent.x - collider.offsetX, collider.parent.y - collider.offsetY], [collider.width, collider.height]);

  return true;
}

TomatoJS.TileCollider.prototype.GetRect = function()
{
  return [this.parent.x - this.offsetX, this.parent.y - this.offsetY,
          this.parent.x - this.offsetX + this.width / 2, this.parent.y - this.offsetY + this.height / 2];
}

TomatoJS.TileCollider.prototype.CheckPointInside = function(x, y)
{
  if (x < this.parent.x - this.offsetX - this.width / 2 || y < this.parent.y - this.offsetY - this.height / 2)
    return false;

  if (x > this.parent.x - this.offsetX + this.width / 2 || y > this.parent.y - this.offsetY + this.height / 2)
    return false;

  return true;
}

TomatoJS.TileCollider.prototype.ResolveSAT = function(objPos, objSize)
{
  var xpen = 0;
  var ypen = 0;

  // Calculate centers
  var myCenterX = this.parent.x - this.offsetX;
  var myCenterY = this.parent.y - this.offsetY;

  // Calculate x penetration
  if (myCenterX < objPos[0])
    xpen = (myCenterX + this.width / 2) - (objPos[0] - objSize[0] / 2);
  else
    xpen = (myCenterX - this.width / 2) - (objPos[0] + objSize[0] / 2);

  // Calculate y penetration
  if (myCenterY < objPos[1])
    ypen = (myCenterY + this.height / 2) - (objPos[1] - objSize[1] / 2);
  else
    ypen = (myCenterY - this.height / 2) - (objPos[1] + objSize[1] / 2);

  // Pick the smallest penetration
  if (Math.abs(xpen) < Math.abs(ypen))
    this.parent.x -= xpen;
  else
    this.parent.y -= ypen;
}

TomatoJS.TileCollider.prototype.CheckCollision = function(tilemap)
{
  this.grounded = false;

  var tiles = this.GetInhabitedTiles(tilemap);

  var graphics = TomatoJS.Core.GetSystem("Graphics");
  var body = this.parent.GetComponent("RigidBody");

  // Check against inhabited tiles
  for (var i in tiles)
  {
    var tile = tiles[i];

    graphics.AddDebugBox(tile.x * tilemap.tile_size, tile.y * tilemap.tile_size, tilemap.tile_size, tilemap.tile_size);

    // The tile is only important if it has collision
    var collisionVal = tilemap.GetTile(tile.x, tile.y, tilemap.CollisionAttr);
    if (collisionVal != tilemap.SolidTile)
      continue;

    // Calculate centers
    var xpen = 0;
    var ypen = 0;
    var myCenterX = this.parent.x - this.offsetX;
    var myCenterY = this.parent.y - this.offsetX;
    var tileCenterX = tile.x * tilemap.tile_size + tilemap.tile_size / 2;
    var tileCenterY = tile.y * tilemap.tile_size + tilemap.tile_size / 2;

    // Calculate x penetration
    if (myCenterX < tileCenterX)
      xpen = (myCenterX + this.width / 2) - (tileCenterX - tilemap.tile_size / 2);
    else
      xpen = (myCenterX - this.width / 2) - (tileCenterX + tilemap.tile_size / 2);

    // Calculate y penetration
    if (myCenterY < tileCenterY)
      ypen = (myCenterY + this.height / 2) - (tileCenterY - tilemap.tile_size / 2);
    else
      ypen = (myCenterY - this.height / 2) - (tileCenterY + tilemap.tile_size / 2);

    // Pick the smallest penetration
    if (Math.abs(xpen) < Math.abs(ypen))
    {
      // To fix catching on edges of tiles, make sure we don't resolve a
      // collision that is impossible
      if (xpen > 0 && tilemap.GetTile(tile.x - 1, tile.y, tilemap.CollisionAttr) == tilemap.SolidTile)
        continue;
      if (xpen < 0 && tilemap.GetTile(tile.x + 1, tile.y, tilemap.CollisionAttr) == tilemap.SolidTile)
        continue;

      this.parent.x -= xpen;
    }
    else
    {
      // To fix catching on edges of tiles, make sure we don't resolve a
      // collision that is impossible
      if (ypen > 0 && tilemap.GetTile(tile.x, tile.y - 1, tilemap.CollisionAttr) == tilemap.SolidTile)
        continue;
      if (ypen < 0 && tilemap.GetTile(tile.x, tile.y + 1, tilemap.CollisionAttr) == tilemap.SolidTile)
        continue;

      this.parent.y -= ypen;
      if (ypen > 0)
      {
        this.grounded = true;
        if (body && body.velocityY > 0)
          body.velocityY = 0;
      }
      else
      {
        if (body && body.velocityY < 0)
          body.velocityY = 0;
      }
    }
  }

  graphics.AddDebugBox(this.parent.x - this.offsetX - this.width / 2, this.parent.y - this.offsetY - this.height / 2, this.width, this.height);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));