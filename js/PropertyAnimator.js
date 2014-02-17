(function (TomatoJS, $, undefined)
{

TomatoJS.PropertyAnimator = function()
{
  this.animations = [];
  this.finishedAnimations = [];
}

TomatoJS.PropertyAnimator.prototype.Update = function(dt)
{
  for (var i in this.animations)
  {
    var finished = AnimationUpdate(dt, this.animations[i]);
    if (finished)
      this.finishedAnimations.push(i);

    if (this.animations[i].blocking)
      break;
  }

  for (var i in this.finishedAnimations)
    this.animations.splice(this.finishedAnimations[i], 1);
  this.finishedAnimations = [];
}

TomatoJS.PropertyAnimator.prototype.Animate = function(obj, property, from, to, duration, blocking, doneCallback)
{
  var animation = {};
  animation.obj = obj;
  animation.property = property;
  animation.from = from;
  animation.to = to;
  animation.duration = duration;
  animation.blocking = (blocking ? true : false);
  animation.doneCallback = doneCallback;
  animation.currentTime = 0;
  animation.done = false;

  this.animations.push(animation);
}

function AnimationUpdate(dt, animation)
{
  if (animation.done)
    return true;

  animation.currentTime += dt;
  if (animation.from == null)
    animation.from = animation.obj[animation.property];
  animation.obj[animation.property] = TomatoJS.Lerp(animation.from, animation.to, animation.currentTime / animation.duration);

  if (animation.currentTime / animation.duration >= 1)
  {
    animation.obj[animation.property] = animation.to;
    animation.done = true;
    if (animation.doneCallback)
      animation.doneCallback();

    return true;
  }

  return false;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));