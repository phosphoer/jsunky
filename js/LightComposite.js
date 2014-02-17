(function (TomatoJS, $, undefined)
{

TomatoJS.LightComposite = function()
{
  this.alpha = 0.9;
  this.zdepth = 201;
}

TomatoJS.LightComposite.prototype.Initialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").AddRenderable(this);
}

TomatoJS.LightComposite.prototype.Uninitialize = function()
{
  TomatoJS.Core.GetSystem("Graphics").RemoveRenderable(this);
}

TomatoJS.LightComposite.prototype.Draw = function(dt, context, camera)
{
  context.save();

  var alpha = TomatoJS.Core.GetSystem("Lighting").ambientLight.level;
  if (alpha < 0) alpha = 0;
  if (alpha > 1) alpha = 1;
  context.globalAlpha = 1.0 - alpha;
  context.drawImage(TomatoJS.Core.GetSystem("Lighting").canvas, 0, 0);

  context.restore();
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));