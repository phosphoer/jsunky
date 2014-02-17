(function (TomatoJS, $, undefined)
{

TomatoJS.Core = 0;

TomatoJS.GameObject = function(object_id)
{
  this.id = object_id;
  this.x = 0;
  this.y = 0;
  this.name = "";
  this.components = {};
  this.flags = {};
  this.initialized = false;
};

TomatoJS.GameObject.prototype.Initialize = function()
{
  // Check for double initialization
  if (this.initialized == true)
    console.log("TomatoJS.Core: Game Object with id " + this.id + " was initialized twice!");

  // Store initialized state
  this.initialized = true;

  // Initialize all components
  for (var i in this.components)
    if (this.components[i].Initialize)
      this.components[i].Initialize();

  // Initialize all components
  for (var i in this.components)
    if (this.components[i].PostInitialize)
      this.components[i].PostInitialize();

  // Inform rest of engine
  TomatoJS.Core.DispatchEvent("OnObjectInitialized", this);
}

TomatoJS.GameObject.prototype.AddComponent = function(name)
{
  if (this.initialized)
  {
    console.log("TomatoJS.Core: Tried to add a component to an already initialized game object. (Not supported)");
    return false;
  }

  if (!TomatoJS[name])
  {
    console.log("TomatoJS.Core: Could not find a class named " + name);
    console.log("TomatoJS.Core: Is it declared in the TomatoJS namespace and included?");
    return false;
  }

  var component = new TomatoJS[name];
  component.parent = this;
  this.components[name] = component;
}

TomatoJS.GameObject.prototype.GetComponent = function(name)
{
  if (this.components[name])
    return this.components[name];
  return null;
}

TomatoJS.GameObject.prototype.AddFlag = function(key, value)
{
  return this.flags[key] = value;
}

TomatoJS.GameObject.prototype.GetFlag = function(flag)
{
  return this.flags[flag];
}

TomatoJS.GameObject.prototype.Invoke = function(name, args)
{
  // Construct arguments
  var message_args = [];
  for (var i = 1; i < arguments.length; ++i)
    message_args.push(arguments[i]);

  for (var i in this.components)
  {
    var func = this.components[i][name];
    if (func)
      func.apply(this.components[i], message_args);
  }
}

TomatoJS.GameObject.prototype.Destroy = function()
{
  TomatoJS.Core.DestroyGameObject(this.id);
}

TomatoJS.GameObject.prototype.DistanceTo = function(gameobj)
{
  var dist = Math.sqrt((this.x - gameobj.x) * (this.x - gameobj.x) + (this.y - gameobj.y) * (this.y - gameobj.y));
  return dist;
}

TomatoJS.Engine = function()
{
  // Set global
  TomatoJS.Core = this;

  // Time tracking
  this.last_time = new Date();
  this.paused = false;

  // Storage for systems
  this.systems = [];

  // Listeners
  this.listeners = {};

  // Events to dispatch later
  this.deferredEvents = [];

  // Canvas
  this.canvas = document.createElement('canvas');

  // Whether or not to hide the cursor
  this.showCursor = true;

  // Center front canvas
  $(this.canvas).css("margin-left", "auto");
  $(this.canvas).css("margin-right", "auto");
  $(this.canvas).css("display", "block");

  // Add canvas to page
  document.body.appendChild(this.canvas);

  // Hide the cursor
  if (!this.showCursor)
    $(this.canvas).css("cursor","none");

  // Input handling
  this.input = new TomatoJS.Input(this.canvas);

  // Audio
  this.audio = new TomatoJS.AudioBank();

  // File manager
  this.fileManager = new TomatoJS.FileManager();

  // Pre loader
  this.resourceManager = new TomatoJS.ResourceManager();

  // Animator
  this.animator = new TomatoJS.PropertyAnimator();

  // Get config data
  this.configFile = this.fileManager.OpenFile("Config.js");
  this.configData = this.configFile.GetJSONObject();

  // Canvas size
  this.canvas.width = this.configData["canvasSize"][0];
  this.canvas.height = this.configData["canvasSize"][1];

  // Game object tracking
  this.current_id = 0;
  this.game_objects = {};
  this.items_to_delete = [];

  // Keep track of if an editor is enabled
  // Useful for other objects to disable conflicting functionality
  this.editorEnabled = false;

  // Total elapsed time since engine began
  this.elapsedTime = 0;

  // Let engine know if window loses focus
  $(window).blur(function()
  {
    TomatoJS.Core.DispatchEvent("OnWindowLoseFocus");
  });

  $(window).focus(function()
  {
    TomatoJS.Core.DispatchEvent("OnWindowGainFocus");
  });

  // requestAnim shim layer by Paul Irish
  window.requestAnimFrame = (function()
  {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(/* function */ callback, /* DOMElement */ element)
            {
              window.setTimeout(callback, 1000 / 60);
            };
  })();
}

TomatoJS.Engine.prototype.Start = function()
{
  // Load all preloaded files first
  this.resourceManager.Load(function()
  {
    // Initialize systems
    for (var i = 0; i < TomatoJS.Core.systems.length; ++i)
    {
      if (TomatoJS.Core.systems[i].Initialize)
        TomatoJS.Core.systems[i].Initialize();
    }

    // Begin update
    EngineUpdate();
  });
}

TomatoJS.Engine.prototype.Pause = function()
{
  this.paused = true;
}

TomatoJS.Engine.prototype.UnPause = function()
{
  this.paused = false;
}

TomatoJS.Engine.prototype.AddSystem = function(name)
{
  if (!TomatoJS[name])
  {
    console.log("TomatoJS.Core: Could not find a class named " + name);
    console.log("TomatoJS.Core: Is it declared in the TomatoJS namespace and included?");
    return false;
  }

  var system = new TomatoJS[name];
  system.systemName_ = name;
  this.systems.push(system);
}

TomatoJS.Engine.prototype.GetSystem = function(name)
{
  for (var i in this.systems)
  {
    if (this.systems[i].systemName_ == name)
      return this.systems[i];
  }

  return null;
}

TomatoJS.Engine.prototype.AddEventListener = function(eventName, obj)
{
  if (!this.listeners[eventName])
    this.listeners[eventName] = [];

  this.listeners[eventName].push(obj);
}

TomatoJS.Engine.prototype.RemoveEventListener = function(eventName, obj)
{
  if (!this.listeners[eventName])
    return;

  for (var i in this.listeners[eventName])
    if (this.listeners[eventName][i] == obj)
      this.listeners[eventName].splice(i, 1);
}

TomatoJS.Engine.prototype.DispatchEvent = function(eventName, args)
{
  // Construct arguments
  var message_args = [];
  for (var i = 1; i < arguments.length; ++i)
    message_args.push(arguments[i]);

  // Dispatch to listeners
  var listeners = this.listeners[eventName];
  if (listeners)
  {
    for (var i in listeners)
    {
      var obj = listeners[i];
      var func = obj[eventName];
      if (func != undefined)
        func.apply(obj, message_args);
    }
  }
}

TomatoJS.Engine.prototype.DispatchEventDeferred = function(eventName, args)
{
  this.deferredEvents.push({"eventName": eventName, "args": args});
}

TomatoJS.Engine.prototype.CreateGameObject = function()
{
  var object = new TomatoJS.GameObject(this.current_id++);
  this.game_objects[object.id] = object;

  return object;
}

TomatoJS.Engine.prototype.LoadGameObject = function(blueprintName, noInitialize)
{
  var blueprint = this.resourceManager.GetBlueprint(blueprintName);

  if (blueprint == undefined)
  {
    console.log("TomatoJS.Core: Could not find blueprint with name " + blueprintName);
    return null;
  }

  var gameobject = this.CreateGameObject();
  gameobject.blueprintName = blueprintName;

  for (var i in blueprint.components)
  {
    if (TomatoJS[i] == undefined)
    {
      console.log("TomatoJS.Core: Could not create a component of type " + i);
      console.log("TomatoJS.Core: Is it declared in the TomatoJS namespace and included?");
      continue;
    }
    var comp = new TomatoJS[i];
    comp.parent = gameobject;
    var compDef = blueprint.components[i];

    for (var j in compDef)
      comp[j] = compDef[j];

    gameobject.components[i] = comp;
  }

  if (!noInitialize)
    gameobject.Initialize();

  return gameobject;
}

TomatoJS.Engine.prototype.GetBlueprint = function(blueprintName)
{
  var blueprint = this.resourceManager.GetBlueprint(blueprintName);
  return blueprint;
}

TomatoJS.Engine.prototype.DestroyGameObject = function(object_id)
{
  this.items_to_delete.push(object_id);
}

TomatoJS.Engine.prototype.DestroyAllGameObjects = function()
{
  for (var i in this.game_objects)
    this.game_objects[i].Destroy();
}

TomatoJS.Engine.prototype.GetGameObjectById = function(id)
{
  var obj = this.game_objects[id];
  if (obj)
    return obj;
  return null;
}

function EngineUpdate()
{
  // Time tracking
  var new_time = new Date();
  var dt = (new_time - TomatoJS.Core.last_time) / 1000.0;
  if (dt > 0.1) dt = 0.1;
  TomatoJS.Core.last_time = new_time;

  // Request that update be called again
  requestAnimFrame(EngineUpdate);

  if (TomatoJS.Core.paused)
    return;

  // Update elapsed time
  this.elapsedTime += dt;

  // Send frame begin message
  TomatoJS.Core.DispatchEvent("OnFrameBegin", dt);

  // Dispatch deferred events
  for (var i in TomatoJS.Core.deferredEvents)
    TomatoJS.Core.DispatchEvent(TomatoJS.Core.deferredEvents[i].eventName, TomatoJS.Core.deferredEvents[i].args);
  TomatoJS.Core.deferredEvents = [];

  // Animate
  TomatoJS.Core.animator.Update(dt);

  // Update systems
  for (var i = 0; i < TomatoJS.Core.systems.length; ++i)
  {
    if (TomatoJS.Core.systems[i].Update)
      TomatoJS.Core.systems[i].Update(dt);
  }

  // Send frame end message
  TomatoJS.Core.DispatchEvent("OnFrameEnd", dt);

  // Delete objects
  for (var i = 0; i < TomatoJS.Core.items_to_delete.length; ++i)
  {
    var obj = TomatoJS.Core.GetGameObjectById(TomatoJS.Core.items_to_delete[i]);
    if (!obj)
      continue;
    TomatoJS.Core.DispatchEvent("OnObjectUninitialized", obj);

    // Uninitialize all components
    for (var j in obj.components)
      if (obj.components[j].Uninitialize)
        obj.components[j].Uninitialize();

    // Remove from tracking
    delete TomatoJS.Core.game_objects[TomatoJS.Core.items_to_delete[i]];
  }
  TomatoJS.Core.items_to_delete = [];
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));