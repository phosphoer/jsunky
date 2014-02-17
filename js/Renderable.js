(function (TomatoJS, $, undefined)
{

TomatoJS.Renderable = function(parent)
{
  this.parent = parent;
  this.imageURL = "";
  this.zdepth = 0;
  this.alpha = 1;
  this.rotation = 0;
  this.offsetX = 0;
  this.offsetY = 0;
  this.width = 0;
  this.height = 0;
  this.animations = null;
  this.currentAnimation = "";
  this.elapsedTime = 0;
}

TomatoJS.Renderable.prototype.Initialize = function()
{
  this.image = TomatoJS.Core.resourceManager.GetImage(this.imageURL);
  this.parent.Invoke("ImageLoaded");
  TomatoJS.Core.GetSystem("Graphics").AddRenderable(this);

  this.UpdateSize();
}

TomatoJS.Renderable.prototype.Uninitialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").RemoveRenderable(this);
}

TomatoJS.Renderable.prototype.OnEdited = function()
{
  this.image = TomatoJS.Core.resourceManager.GetImage(this.imageURL);
  this.parent.Invoke("ImageLoaded");
}

TomatoJS.Renderable.prototype.Draw = function(dt, context, camera)
{
  this.elapsedTime += dt;

  // Update image if necessary
  // if (!this.image || this.imageURL != this.image.url)
  //   this.image = TomatoJS.Core.resourceManager.GetImage(this.imageURL);

  // Calculate size
  this.UpdateSize();

  // Calculate draw position
  var x = this.parent.x - camera.x - this.width / 2;
  var y = this.parent.y - camera.y - this.height / 2;

  // Don't draw if off screen
  if (this.IsOffScreen())
    return;

  if (this.alpha != 1)
  {
    context.save();
    context.globalAlpha = this.alpha;
  }

  if (this.animations)
  {
    var anim = null;
    if (this.animations)
      anim = TomatoJS.Core.resourceManager.GetAnimation(this.animations[this.currentAnimation]);

    if (this.rotation != 0)
      anim.Draw(context, this.elapsedTime, x, y, this.rotation, this.offsetX, this.offsetY);
    else
      anim.Draw(context, this.elapsedTime, x - this.offsetX, y - this.offsetY);
  }
  else
  {
    // I don't pass rotation if it is zero because the draw function does less work
    // if rotation isn't specified
    if (this.rotation != 0)
      this.image.Draw(context, x, y, this.rotation, this.offsetX, this.offsetY);
    else
      this.image.Draw(context, x - this.offsetX, y - this.offsetY);
  }

  if (this.alpha != 1)
    context.restore();
}

TomatoJS.Renderable.prototype.IsOffScreen = function()
{
  this.UpdateSize();
  var camera = TomatoJS.Core.GetSystem("Graphics").camera;

  if ((this.parent.x - camera.x + this.width / 2) * TomatoJS.CoreScale < 0)
    return true;
  if ((this.parent.y - camera.y + this.height / 2) * TomatoJS.CoreScale < 0)
    return true;
  if ((this.parent.x - camera.x - this.width / 2) * TomatoJS.CoreScale > TomatoJS.Core.canvas.width)
    return true;
  if ((this.parent.y - camera.y - this.height / 2) * TomatoJS.CoreScale > TomatoJS.Core.canvas.height)
    return true;

  return false;
}

TomatoJS.Renderable.prototype.UpdateSize = function()
{
  var anim = null;
  if (this.animations)
    anim = TomatoJS.Core.resourceManager.GetAnimation(this.animations[this.currentAnimation]);
  this.width = (this.animations ? anim.frameWidth : this.image.width);
  this.height = (this.animations ? anim.frameHeight : this.image.height);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));