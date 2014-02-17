(function (TomatoJS, $, undefined)
{

TomatoJS.CoreScale = 3;

TomatoJS.tilesetCollision =
[
  0,
  1
];

TomatoJS.collisionImage =
[
  new TomatoJS.PixelImage("res/imgs/core/collision-empty.png", TomatoJS.CoreScale),
  new TomatoJS.PixelImage("res/imgs/core/collision-solid.png", TomatoJS.CoreScale)
];

TomatoJS.Tileset = function(imagePath)
{
  this.tileWidth = 16;
  this.tileHeight = 16;
  this.imageURL = imagePath;
  this.image = null;
}

TomatoJS.Tileset.prototype.Initialize = function()
{
  var that = this;
  this.image = TomatoJS.Core.resourceManager.GetImage(this.imageURL, function()
  {
    that.tilesX = that.image.width / that.tileWidth;
    that.tilesY = that.image.height / that.tileHeight;
  });
}

TomatoJS.Tileset.prototype.DrawTileAtPosition = function(context, index, x, y)
{
  var clipX = (index) % this.tilesX;
  var clipY = Math.floor((index) / this.tilesX);
  this.image.DrawClipped(context, x, y, clipX * this.tileWidth, clipY * this.tileHeight, this.tileWidth, this.tileHeight);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));