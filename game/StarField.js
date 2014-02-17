(function (TomatoJS, $, undefined)
{

TomatoJS.StarField = function(parent)
{
  this.parent = parent;
  this.zdepth = -5;
  this.numStars = 100;

  this.stars = [];
}

TomatoJS.StarField.prototype.Initialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").AddRenderable(this);

  for (var i = 0; i < this.numStars; ++i)
  {
    this.stars.push([Math.random() * TomatoJS.Core.canvas.width, Math.random() * TomatoJS.Core.canvas.height, Math.random()]);
  }
}

TomatoJS.StarField.prototype.Uninitialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").RemoveRenderable(this);
}

TomatoJS.StarField.prototype.Draw = function(dt, context, camera)
{
  for (var i = 0; i < this.numStars; ++i)
  {
    var star = this.stars[i];
    star[1] += 90 * dt * star[2];

    if (star[1] > TomatoJS.Core.canvas.height)
      star[1] = 0;

    var b = star[2] * 0.75 + 0.25;
    context.fillStyle = "rgba(255, 255, 255, " + b + ")";
    context.fillRect(star[0], star[1], 2, 2);
  }
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));