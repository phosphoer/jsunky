(function (TomatoJS, $, undefined)
{

TomatoJS.ResourceManager = function()
{
  this.loadedAnimations = {};
  this.loadedBlueprints = {};
  this.loadedImages = {};
  this.loadedLevels = {};
  this.loadedTilesets = {};

  this.loader = new TomatoJS.PreLoader();
}

TomatoJS.ResourceManager.prototype.Load = function(finishCallback)
{
  var that = this;
  this.loader.Load(function()
  {
    that.loadedImages = that.loader.loadedImages;
    finishCallback();
  });
}

TomatoJS.ResourceManager.prototype.GetAnimation = function(filePath)
{
  var anim = this.loadedAnimations[filePath];
  if (!anim)
  {
    var data = TomatoJS.Core.fileManager.OpenFile(TomatoJS.Core.configData["animationPath"] + filePath).GetJSONObject();
    anim = new TomatoJS.Animation();
    for (var i in data)
      anim[i] = data[i];

    this.loadedAnimations[filePath] = anim;
    anim.Initialize();
  }

  return anim;
}

TomatoJS.ResourceManager.prototype.GetBlueprint = function(filePath)
{
  var blueprint = this.loadedBlueprints[filePath];
  if (!blueprint)
  {
    blueprint = TomatoJS.Core.fileManager.OpenFile(TomatoJS.Core.configData["blueprintPath"] + filePath).GetJSONObject();
    this.loadedBlueprints[filePath] = blueprint;
  }

  return blueprint;
}

TomatoJS.ResourceManager.prototype.GetImage = function(filePath, callback)
{
  var image = this.loadedImages[filePath];
  if (!image)
  {
    image = new TomatoJS.PixelImage(TomatoJS.Core.configData["imagePath"] + filePath, TomatoJS.CoreScale, function()
    {
      if (callback)
        callback();
    });
    this.loadedImages[filePath] = image;
  }

  return image;
}

TomatoJS.ResourceManager.prototype.GetLevel = function(filePath)
{
  var level = this.loadedBlueprints[filePath];
  if (!level)
  {
    level = TomatoJS.Core.fileManager.OpenFile(TomatoJS.Core.configData["levelPath"] + filePath).GetJSONObject();
    this.loadedLevels[filePath] = level;
  }

  return level;
}

TomatoJS.ResourceManager.prototype.GetSound = function(filePath)
{
  return TomatoJS.Core.fileManager.OpenFile(TomatoJS.Core.configData["soundPath"] + filePath);
}

TomatoJS.ResourceManager.prototype.GetTileset = function(filePath)
{
  var tileset = this.loadedTilesets[filePath];
  if (!tileset)
  {
    var data = TomatoJS.Core.fileManager.OpenFile(TomatoJS.Core.configData["tilesetPath"] + filePath).GetJSONObject();
    tileset = new TomatoJS.Tileset();
    for (var i in data)
      tileset[i] = data[i];

    this.loadedTilesets[filePath] = tileset;
    tileset.Initialize();
  }

  return tileset;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));