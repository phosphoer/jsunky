(function (TomatoJS, $, undefined)
{

TomatoJS.Animatable = function(parent)
{
  this.parent = parent;
  this.animator = new TomatoJS.PropertyAnimator();
}

TomatoJS.Animatable.prototype.Initialize = function()
{
  TomatoJS.Core.AddEventListener("OnFrameBegin", this);
}

TomatoJS.Animatable.prototype.Uninitialize = function()
{
  TomatoJS.Core.RemoveEventListener("OnFrameBegin", this);
}

TomatoJS.Animatable.prototype.OnFrameBegin = function(dt)
{
  this.animator.Update(dt);
}

TomatoJS.Animatable.prototype.Animate = function(property, from, to, duration, blocking, doneCallback)
{
  this.animator.Animate(this.parent, property, from, to, duration, blocking, doneCallback);
}

TomatoJS.Animatable.prototype.AnimateComponent = function(component, property, from, to, duration, blocking, doneCallback)
{
  this.animator.Animate(this.parent.GetComponent(component), property, from, to, duration, blocking, doneCallback);
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));