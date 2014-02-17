(function (TomatoJS, $, undefined)
{

TomatoJS.Lighting = function()
{
  this.ambientLight = null;
  this.lightComposite = null;
  this.currentLightsOnScreen = 0;
  this.numLightsOnScreen = 0;

  // Create canvas for storing lighting
  this.canvas = document.createElement('canvas');
  this.canvas.width = TomatoJS.Core.canvas.width;
  this.canvas.height = TomatoJS.Core.canvas.height;
  this.context = this.canvas.getContext('2d');
}

TomatoJS.Lighting.prototype.Initialize = function()
{
  this.ambientLight = TomatoJS.Core.LoadGameObject("AmbientLight.json");
  this.lightComposite = TomatoJS.Core.LoadGameObject("LightComposite.json");
}

TomatoJS.Lighting.prototype.Uninitialize = function()
{
  this.ambientLight.Destroy();
  this.lightComposite.Destroy();
}

TomatoJS.Lighting.prototype.Update = function()
{
  this.numLightsOnScreen = this.currentLightsOnScreen;
  this.currentLightsOnScreen = 0;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));