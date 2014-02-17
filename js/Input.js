(function (TomatoJS, $, undefined)
{

// Input system
TomatoJS.Input = function(canvas)
{
  // Object thats going to be used as a dictionary
  this.pressedKeys = {};

  // Register for events
  var that = this;
  window.addEventListener('keydown', function(event)
  {
    // Prevent backspace when a field is not in focus
    var src = event.srcElement || event.target;
    var inputFocus = ($(src).is("input") || $(src).is("textarea")) ? true : false;
    if (event.keyCode == that.BACKSPACE && !inputFocus)
    {
      event.preventDefault();
      event.stopPropagation();
    }

    // Unfocus text fields when escape is pressed
    if (event.keyCode == that.ESCAPE)
    {
      $("textarea").blur();
      $("input").blur();
    }

    // Don't send out the event if an input is in focus
    if (!inputFocus)
    {
      that.pressedKeys[event.keyCode] = true;
      TomatoJS.Core.DispatchEventDeferred("OnKeyDown", event.keyCode);
    }
  }, false);
  window.addEventListener('keyup', function(event)
  {
    // Prevent backspace when a field is not in focus
    var src = event.srcElement || event.target;
    var inputFocus = ($(src).is("input") || $(src).is("textarea")) ? true : false;
    if (event.keyCode == that.BACKSPACE && !inputFocus)
    {
      event.preventDefault();
      event.stopPropagation();
    }

    // Don't send out the event if an input is in focus
    if (!inputFocus)
    {
      delete that.pressedKeys[event.keyCode];
      TomatoJS.Core.DispatchEventDeferred("OnKeyUp", event.keyCode);
    }
  }, false);

  canvas.addEventListener('contextmenu', function(event)
  {
    event.stopPropagation();
    event.preventDefault();
    return false;
  });

  canvas.addEventListener('mousedown', function(event)
  {
    event.stopPropagation();
    event.preventDefault();

    var canvasPos = TomatoJS.GetMousePos(event);
    if (!canvasPos)
      return;

    var eventData = {};
    eventData.canvasX = canvasPos.x;
    eventData.canvasY = canvasPos.y;
    eventData.pageX = event.pageX;
    eventData.pageY = event.pageY;
    that.mouseX = eventData.canvasX;
    that.mouseY = eventData.canvasY;

    if (event.which == 1)
    {
      that.pressedKeys[that.LEFT_MOUSE] = true;
      eventData.which = that.LEFT_MOUSE;
    }
    else if (event.which == 3)
    {
      that.pressedKeys[that.RIGHT_MOUSE] = true;
      eventData.which = that.RIGHT_MOUSE;
    }

    TomatoJS.Core.DispatchEventDeferred("OnMouseDown", eventData);

  }, false);

  canvas.addEventListener('mouseup', function(event)
  {
    var canvasPos = TomatoJS.GetMousePos(event);
    if (!canvasPos)
      return;

    var eventData = {};
    eventData.canvasX = canvasPos.x;
    eventData.canvasY = canvasPos.y;
    eventData.pageX = event.pageX;
    eventData.pageY = event.pageY;
    eventData.which = that.LEFT_MOUSE;
    that.mouseX = eventData.canvasX;
    that.mouseY = eventData.canvasY;

    if (event.which == 1)
    {
      delete that.pressedKeys[that.LEFT_MOUSE];
      eventData.which = that.LEFT_MOUSE;
    }
    else if (event.which == 3)
    {
      delete that.pressedKeys[that.RIGHT_MOUSE];
      eventData.which = that.RIGHT_MOUSE;
    }

    TomatoJS.Core.DispatchEventDeferred("OnMouseUp", eventData);

  }, false);

  canvas.addEventListener('mousemove', function(event)
  {
    var canvasPos = TomatoJS.GetMousePos(event);
    if (!canvasPos)
      return;

    var eventData = {};
    eventData.canvasX = canvasPos.x;
    eventData.canvasY = canvasPos.y;
    eventData.pageX = event.pageX;
    eventData.pageY = event.pageY;
    eventData.moveX = eventData.canvasX - that.mouseX;
    eventData.moveY = eventData.canvasY - that.mouseY;

    that.mouseX = eventData.canvasX;
    that.mouseY = eventData.canvasY;

    TomatoJS.Core.DispatchEventDeferred("OnMouseMove", eventData);

  }, false);

  document.addEventListener("touchstart", function(event)
  {
    event.preventDefault();
    var touch = (event.originalEvent && event.originalEvent.touches[0]) || event.touches[0] || event.changedTouches[0];
    var canvasPos = TomatoJS.GetTouchPos(touch);
    if (!canvasPos)
      return;

    var eventData = {};
    eventData.canvasX = canvasPos.x;
    eventData.canvasY = canvasPos.y;
    eventData.pageX = touch.pageX;
    eventData.pageY = touch.pageY;

    that.touchX = eventData.canvasX;
    that.touchY = eventData.canvasY;

    if (TomatoJS.Core.configData["emulateTouches"])
    {
      that.mouseX = eventData.canvasX;
      that.mouseY = eventData.canvasY;
      TomatoJS.Core.DispatchEventDeferred("OnMouseDown", eventData);
    }

    TomatoJS.Core.DispatchEventDeferred("OnTouchDown", eventData);

  }, false);

  document.addEventListener("touchend", function(event)
  {
    event.preventDefault();
    var touch = (event.originalEvent && event.originalEvent.touches[0]) || event.touches[0] || event.changedTouches[0];
    var canvasPos = TomatoJS.GetTouchPos(touch);
    if (!canvasPos)
      return;

    var eventData = {};
    eventData.canvasX = canvasPos.x;
    eventData.canvasY = canvasPos.y;
    eventData.pageX = touch.pageX;
    eventData.pageY = touch.pageY;

    that.touchX = eventData.canvasX;
    that.touchY = eventData.canvasY;

    if (TomatoJS.Core.configData["emulateTouches"])
    {
      that.mouseX = eventData.canvasX;
      that.mouseY = eventData.canvasY;
      TomatoJS.Core.DispatchEventDeferred("OnMouseUp", eventData);
    }

    TomatoJS.Core.DispatchEventDeferred("OnTouchUp", eventData);

  }, false);

  document.addEventListener("touchmove", function(event)
  {
    event.preventDefault();
    var touch = (event.originalEvent && event.originalEvent.touches[0]) || event.touches[0] || event.changedTouches[0];
    var canvasPos = TomatoJS.GetTouchPos(touch);
    if (!canvasPos)
      return;

    var eventData = {};
    eventData.canvasX = canvasPos.x;
    eventData.canvasY = canvasPos.y;
    eventData.pageX = touch.pageX;
    eventData.pageY = touch.pageY;
    eventData.moveX =  eventData.canvasX - that.touchX;
    eventData.moveY =  eventData.canvasY - that.touchY;

    that.touchX = eventData.canvasX;
    that.touchY = eventData.canvasY;

    if (TomatoJS.Core.configData["emulateTouches"])
    {
      that.mouseX = eventData.canvasX;
      that.mouseY = eventData.canvasY;
      TomatoJS.Core.DispatchEventDeferred("OnMouseMove", eventData);
    }

    TomatoJS.Core.DispatchEventDeferred("OnTouchMove", eventData);

  }, false);

  // Mouse state
  this.mouseX = 0;
  this.mouseY = 0;

  // Touch state
  this.touchX = 0;
  this.touchY = 0;

  // List of all the keys we may need
  this.LEFT_MOUSE = 500;
  this.RIGHT_MOUSE = 501;

  this.LEFT_ARROW = 37;
  this.UP_ARROW = 38;
  this.RIGHT_ARROW = 39;
  this.DOWN_ARROW = 40;
  this.SHIFT = 16;
  this.BACKSPACE = 8;
  this.ESCAPE = 27;
  this.SPACE = 32;
  this.A = 65;
  this.B = 66;
  this.C = 67;
  this.D = 68;
  this.E = 69;
  this.F = 70;
  this.G = 71;
  this.H = 72;
  this.I = 73;
  this.J = 74;
  this.K = 75;
  this.L = 76;
  this.M = 77;
  this.N = 78;
  this.O = 79;
  this.P = 80;
  this.Q = 81;
  this.R = 82;
  this.S = 83;
  this.T = 84;
  this.U = 85;
  this.V = 86;
  this.W = 87;
  this.X = 88;
  this.Y = 89;
  this.Z = 90;
  this.NUM1 = 49;
  this.NUM2 = 50;
  this.NUM3 = 51;
  this.NUM4 = 52;
  this.NUM5 = 53;
  this.NUM6 = 54;
  this.NUM7 = 55;
  this.NUM8 = 56;
  this.NUM9 = 57;
  this.NUM0 = 48;
}

TomatoJS.Input.prototype.IsDown = function(keyCode)
{
  return this.pressedKeys[keyCode];
}

TomatoJS.GetMousePos = function(event)
{
  if (event.offsetX)
  {
    return {"x": event.offsetX, "y": event.offsetY};
  }
  else if (event.layerX)
  {
    return {"x": event.layerX, "y": event.layerY};
  }

  return null;
}

TomatoJS.GetTouchPos = function(event)
{
  return {"x": event.clientX - event.target.offsetLeft, "y": event.clientY - event.target.offsetTop};
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));