(function (TomatoJS, $, undefined)
{

TomatoJS.Light = function()
{
  this.red = 1.0;
  this.green = 0.9;
  this.blue = 0.9;
  this.level = 1.0;
  this.radius = 40;
  this.arc = Math.PI * 2;
  this.offsetX = 0;
  this.offsetY = 0;
  this.angle = 0;
  this.active = true;
  this.numRays = 100;
  this.notifyTime = 1;
  this.notifyTimer = 0;
  this.zdepth = 200;
  this.tileLayer = 0;
}

TomatoJS.Light.prototype.Initialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").AddRenderable(this);
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.Light.prototype.Uninitialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").RemoveRenderable(this);
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.Light.prototype.OnFrameBegin = function(dt)
{
  if (!this.active)
    return;

  // Make objects notice they came into the light
  var tileSystem = TomatoJS.Core.GetSystem("TileSystem");
  var origin = [this.parent.x + this.offsetX, this.parent.y + this.offsetY];

  this.notifyTimer += dt;
  if (this.notifyTimer > this.notifyTime)
  {
    this.notifyTimer = 0;

    var nearby = tileSystem.GetCollidersInRadius(origin[0], origin[1], this.radius);
    for (var i in nearby)
    {
      if (tileSystem.InLineOfSight(tileSystem.GetTileMap(this.tileLayer), origin[0], origin[1], nearby[i].parent.x, nearby[i].parent.y, this.angle, this.arc))
        nearby[i].parent.Invoke("OnEnterLight", origin[0], origin[1]);
    }
  }
}

TomatoJS.Light.prototype.Draw = function(dt, context, camera)
{
  if (!this.active)
    return;

  // Get color info
  var r = Math.floor(this.red * 255);
  var g = Math.floor(this.green * 255);
  var b = Math.floor(this.blue * 255);
  var a = this.level;

  // Get position to draw at
  var x = (this.parent.x - camera.x) * TomatoJS.CoreScale;
  var y = (this.parent.y - camera.y) * TomatoJS.CoreScale;

  // Don't draw if off screen
  canvas = TomatoJS.Core.GetSystem("Lighting").canvas;
  if (x + this.radius * TomatoJS.CoreScale < 0 || y + this.radius * TomatoJS.CoreScale < 0)
    return;
  if (x - this.radius * TomatoJS.CoreScale > canvas.width || y - this.radius * TomatoJS.CoreScale > canvas.height)
    return;

  ++TomatoJS.Core.GetSystem("Lighting").currentLightsOnScreen;

  // Find out what layer we are on
  if (this.parent.GetComponent("TileCollider"))
    this.tileLayer = this.parent.GetComponent("TileCollider").tileLayer;

  // Perform ray casts to determine light shape
  var lightPoints = [];
  var tilesystem = TomatoJS.Core.GetSystem("TileSystem");
  var tilemap = tilesystem.GetTileMap(this.tileLayer);

  if (this.arc == Math.PI * 2)
  {
    for (var i = 0; i < this.numRays; ++i)
    {
      var angle = ((this.arc) / this.numRays) * i;
      var toX = this.parent.x + Math.cos(angle) * this.radius;
      var toY = this.parent.y + Math.sin(angle) * this.radius;
      var ignore = {};
      ignore[this.parent.id] = true;
      var ray = tilesystem.RaycastToPoint(tilemap, this.parent.x, this.parent.y, toX, toY, true, ignore, true);

      if (ray.collision)
        lightPoints.push([(ray.x - camera.x) * TomatoJS.CoreScale, (ray.y - camera.y) * TomatoJS.CoreScale]);
      else
        lightPoints.push([(toX - camera.x) * TomatoJS.CoreScale, (toY - camera.y) * TomatoJS.CoreScale]);
    }
  }
  else
  {
    lightPoints.push([(this.parent.x + this.offsetX - camera.x) * TomatoJS.CoreScale, (this.parent.y + this.offsetY - camera.y) * TomatoJS.CoreScale]);
    for (var i = 0; i < this.numRays; ++i)
    {
      var angle = ((this.arc) / this.numRays) * i + this.angle - this.arc / 2;
      var toX = this.parent.x + Math.cos(angle) * this.radius + this.offsetX;
      var toY = this.parent.y + Math.sin(angle) * this.radius + this.offsetY;
      var ignore = {};
      ignore[this.parent.id] = true;
      var ray = tilesystem.RaycastToPoint(tilemap, this.parent.x + this.offsetX, this.parent.y + this.offsetY, toX, toY, true, ignore, true);

      if (ray.collision)
        lightPoints.push([(ray.x - camera.x) * TomatoJS.CoreScale, (ray.y - camera.y) * TomatoJS.CoreScale]);
      else
        lightPoints.push([(toX - camera.x) * TomatoJS.CoreScale, (toY - camera.y) * TomatoJS.CoreScale]);
    }
    lightPoints.push([(this.parent.x + this.offsetX - camera.x) * TomatoJS.CoreScale, (this.parent.y + this.offsetY - camera.y) * TomatoJS.CoreScale]);
  }

  // Get context
  context = TomatoJS.Core.GetSystem("Lighting").context;
  context.save();

  // Set blend mode to work with lights
  context.globalCompositeOperation = "destination-out";

  // Build gradient
  var grad = context.createRadialGradient(x, y, (this.radius / 3) * TomatoJS.CoreScale, x, y, this.radius * TomatoJS.CoreScale);
  grad.addColorStop(0, "rgba(" + r + ", " + g + ", " + b + ", " + a + ")");
  grad.addColorStop(1, "rgba(" + r + ", " + g + ", " + b + ", " + 0 + ")");

  // Draw light
  context.fillStyle = grad;
  context.beginPath();
  // context.arc(x, y, this.radius, 0, 2 * Math.PI, false);
  context.moveTo(lightPoints[0][0], lightPoints[0][1]);
  for (var i = 1; i < lightPoints.length; ++i)
    context.lineTo(lightPoints[i][0], lightPoints[i][1]);
  context.lineTo(lightPoints[0][0], lightPoints[0][1]);
  context.fill();
  context.closePath();

  context.restore();
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));