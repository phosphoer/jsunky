(function (TomatoJS, $, undefined)
{

TomatoJS.ObjectSpawner = function(parent)
{
  this.parent = parent;
  this.spawnBlueprint = null;
  this.spawnTime = 5;
  this.spawnTimer = 0;
  this.spawnOffsetX = 0;
  this.spawnOffsetY = 0;
}

TomatoJS.ObjectSpawner.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.ObjectSpawner.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.ObjectSpawner.prototype.OnFrameBegin = function(dt)
{
  if (!this.spawnBlueprint || TomatoJS.Core.editorEnabled)
    return;

  this.spawnTimer += dt;

  if (this.spawnTimer >= this.spawnTime)
  {
    this.spawnTimer = 0;
    var obj = TomatoJS.Core.LoadGameObject(this.spawnBlueprint);
    obj.x = this.parent.x + this.spawnOffsetX;
    obj.y = this.parent.y + this.spawnOffsetY;
  }
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));