(function (TomatoJS, $, undefined)
{

TomatoJS.TileSystem = function()
{
  this.colliders = {};
  this.tilemaps = [];
  this.editorObjects = {};

  this.activeLayer = 0;
  this.activeTile = null;
  this.activeCollision = 0;
  this.activeObject = null;
  this.selectedObject = null;
  this.selectedObjectSize = [0, 0];
  this.dragging = false;
  this.dragBeginPos = [0, 0];

  this.colliderMap = new TomatoJS.TileMap();
  this.colliderMap.tile_size = 32;
  this.editorEnabled = false;
  this.pendingClear = false;

  TomatoJS.Core.AddEventListener("OnObjectInitialized", this);
  TomatoJS.Core.AddEventListener("OnObjectUninitialized", this);
  TomatoJS.Core.AddEventListener("OnKeyDown", this);
}

TomatoJS.TileSystem.prototype.EnableEditing = function()
{
  this.editorEnabled = true;
  TomatoJS.Core.GetSystem("Graphics").debugDrawEnabled = true;

  // Create tile graphic
  this.editor = TomatoJS.Core.CreateGameObject();
  this.editor.AddComponent("GridDraw");
  this.editor.Initialize();s

  TomatoJS.Core.AddEventListener("OnMouseDown", this);
  TomatoJS.Core.AddEventListener("OnMouseMove", this);
  TomatoJS.Core.AddEventListener("OnMouseUp", this);
  TomatoJS.Core.DispatchEvent("OnEditorToggle", true);

  this.BuildUI();

  this.editorCamera = TomatoJS.Core.CreateGameObject();
  this.editorCamera.AddComponent("EditorController");
  this.editorCamera.x = TomatoJS.Core.GetSystem("Graphics").camera.x;
  this.editorCamera.y = TomatoJS.Core.GetSystem("Graphics").camera.y;
  this.editorCamera.Initialize();

  TomatoJS.Core.editorEnabled = true;

  $(TomatoJS.Core.canvas).css("cursor","crosshair");
}

TomatoJS.TileSystem.prototype.DisableEditing = function()
{
  this.editorEnabled = false;
  TomatoJS.Core.GetSystem("Graphics").debugDrawEnabled = false;
  this.editor.Destroy();
  $("#editorui").remove();

  TomatoJS.Core.RemoveEventListener("OnMouseDown", this);
  TomatoJS.Core.RemoveEventListener("OnMouseMove", this);
  TomatoJS.Core.RemoveEventListener("OnMouseUp", this);
  TomatoJS.Core.DispatchEvent("OnEditorToggle", false);

  this.editorCamera.Destroy();

  TomatoJS.Core.editorEnabled = false;

  if (!TomatoJS.Core.showCursor)
    $(TomatoJS.Core.canvas).css("cursor","none");
  else
    $(TomatoJS.Core.canvas).css("cursor","auto");
}

TomatoJS.TileSystem.prototype.OnKeyDown = function(keycode)
{
  // Enable editor
  if (keycode == TomatoJS.Core.input.E)
  {
    if (this.editorEnabled == false)
      this.EnableEditing();
    else
      this.DisableEditing();
  }

  // Editor related things
  if (!this.editorEnabled)
    return;

  // Drag object
  if (keycode == TomatoJS.Core.input.G && this.selectedObject)
  {
    this.dragging = !this.dragging;
    this.dragBeginPos = [this.selectedObject.x, this.selectedObject.y];
  }

  // Delete object
  if (keycode == TomatoJS.Core.input.BACKSPACE && this.selectedObject)
  {
    delete this.editorObjects[this.selectedObject.id];
    this.selectedObject.Destroy();
    this.selectedObject = null;
    this.BuildPropUI();
  }
}

TomatoJS.TileSystem.prototype.OnMouseMove = function(event)
{
  var camera = TomatoJS.Core.GetSystem("Graphics").camera;
  var pos = {"x": event.canvasX, "y": event.canvasY};
  pos.x /= TomatoJS.CoreScale;
  pos.y /= TomatoJS.CoreScale;
  pos.x += camera.x;
  pos.y += camera.y;

  // If we have a selected object, drag it
  if (this.dragging && this.selectedObject)
  {
    var obj = this.selectedObject;
    obj.x = pos.x;
    obj.y = pos.y;
    var editorObject = this.editorObjects[obj.id];
    if (editorObject)
    {
      editorObject.x = obj.x;
      editorObject.y = obj.y;
    }
    return;
  }

  // Find out which panel is active
  var panel = $("#ui-editor-main").accordion("option", "active");
  if (TomatoJS.Core.input.IsDown(TomatoJS.Core.input.LEFT_MOUSE))
  {
    if (panel == 0)
      this.tilemaps[this.activeLayer].SetTileInWorld(pos.x, pos.y, TileMap.prototype.ImageAttr, this.activeTile);
    else if (panel == 1)
      this.tilemaps[this.activeLayer].SetTileInWorld(pos.x, pos.y, TileMap.prototype.CollisionAttr, this.activeCollision);
  }
}

TomatoJS.TileSystem.prototype.OnMouseDown = function(event)
{
  var camera = TomatoJS.Core.GetSystem("Graphics").camera;
  var pos = {"x": event.canvasX, "y": event.canvasY};
  pos.x /= TomatoJS.CoreScale;
  pos.y /= TomatoJS.CoreScale;
  pos.x += camera.x;
  pos.y += camera.y

  // If left mouse, place tile or object
  if (event.which == TomatoJS.Core.input.LEFT_MOUSE)
  {
    // Find out which panel is active
    var panel = $("#ui-editor-main").accordion("option", "active");

    // If we are dragging an object, that takes priority
    if (this.dragging)
    {
      this.dragging = false;
    }
    else if (panel == 0)
      this.tilemaps[this.activeLayer].SetTileInWorld(pos.x, pos.y, TileMap.prototype.ImageAttr, this.activeTile);
    else if (panel == 1)
      this.tilemaps[this.activeLayer].SetTileInWorld(pos.x, pos.y, TileMap.prototype.CollisionAttr, this.activeCollision);
    else if (panel == 2)
    {
      // Create the object
      var obj = TomatoJS.Core.LoadGameObject(this.activeObject);
      obj.x = (pos.x / this.tilemaps[this.activeLayer].tile_size) * this.tilemaps[this.activeLayer].tile_size;
      obj.y = (pos.y / this.tilemaps[this.activeLayer].tile_size) * this.tilemaps[this.activeLayer].tile_size;
      if (obj.GetComponent("TileCollider"))
        obj.GetComponent("TileCollider").tileLayer = this.activeLayer;

      // Put it in our list of objects for the level
      this.editorObjects[obj.id] = {"blueprint": this.activeObject, "x": obj.x, "y": obj.y};
      this.editorObjects[obj.id].modifiedData = {"TileCollider":{"tileLayer": this.activeLayer}};
    }
  }
  // Otherwise, select object
  else if (event.which == TomatoJS.Core.input.RIGHT_MOUSE)
  {
    // If we are dragging an object, cancel it
    if (this.dragging)
    {
      this.dragging = false;
      this.selectedObject.x = this.dragBeginPos[0];
      this.selectedObject.y = this.dragBeginPos[1];
      return;
    }
    this.selectedObject = null;
    for (var i in TomatoJS.Core.game_objects)
    {
      // Get the object data
      var obj = TomatoJS.Core.game_objects[i];
      var col = obj.GetComponent("TileCollider");
      var ren = obj.GetComponent("Renderable");

      // Get object size
      var width = col ? col.width : (ren ? ren.image.width : 16);
      var height = col ? col.height : (ren ? ren.image.height : 16);
      this.selectedObjectSize = [width, height];

      // Find out if object is under mouse
      if (Vec2ContainedInRect([pos.x, pos.y], [obj.x - width / 2, obj.y - height / 2], this.selectedObjectSize))
      {
        this.selectedObject = obj;
        break;
      }
    }

    this.BuildPropUI();
  }
}

TomatoJS.TileSystem.prototype.OnMouseUp = function(event)
{
}

TomatoJS.TileSystem.prototype.GetTileMap = function(index)
{
  return this.tilemaps[index];
}

TomatoJS.TileSystem.prototype.AddTileMap = function(obj)
{
  this.tilemaps.push(obj);
  TomatoJS.Core.GetSystem("Graphics").AddRenderable(obj);

  if (this.editorEnabled)
    $("<option>" + (this.tilemaps.length - 1) + "</option>").appendTo($('#ui-layer-select'));
}

TomatoJS.TileSystem.prototype.RemoveTileMap = function(obj)
{
  for (var i = 0; i < this.tilemaps.length; ++i)
  {
    if (this.tilemaps[i] == obj)
    {
      this.tilemaps.splice(i, 1);
      TomatoJS.Core.GetSystem("Graphics").RemoveRenderable(obj);

      if (this.activeLayer == i)
        this.activeLayer = 0;
    }
  }

  var index = $('#ui-layer-select').prop("selectedIndex")
  $('#ui-layer-select').children().eq(index).remove();
  --index;
  if (index < 0) index = 0;
  $('#ui-layer-select').prop("selectedIndex", index);
}

TomatoJS.TileSystem.prototype.OnObjectInitialized = function(obj)
{
  var component = obj.GetComponent("TileCollider");
  if (component)
    this.colliders[obj.id] = component;
}

TomatoJS.TileSystem.prototype.OnObjectUninitialized = function(obj)
{
  var component = obj.GetComponent("TileCollider");
  if (component)
    delete this.colliders[obj.id];
}

TomatoJS.TileSystem.prototype.Update = function(dt)
{
  // If we have no tilemaps, don't do anything
  if (this.tilemaps.length == 0)
  {
    this.AddTileMap(new TomatoJS.TileMap());
  }

  // Clear objects in tilemap
  this.colliderMap.ClearObjects();

  // Check all colliders against all tilemaps
  for (var i in this.colliders)
  {
    var collider = this.colliders[i];
    var tilemap = this.tilemaps[collider.tileLayer];

    // Wrap collider
    if (collider.wrap)
    {
      var oldX = collider.parent.x;
      var oldY = collider.parent.y;
      while (collider.parent.x < 0) collider.parent.x += tilemap.width * tilemap.tile_size;
      while (collider.parent.y < 0) collider.parent.y += tilemap.height * tilemap.tile_size;
      while (collider.parent.x >= tilemap.width * tilemap.tile_size) collider.parent.x -= tilemap.height * tilemap.tile_size;
      while (collider.parent.y >= tilemap.height * tilemap.tile_size) collider.parent.y -= tilemap.height * tilemap.tile_size;
      if (oldX != collider.parent.x || oldY != collider.parent.y)
        collider.parent.Invoke("OnWrapped");
    }

    // Register the collider in the tilemap
    collider.RegisterTiles(this.colliderMap);

    // Collide against tilemap
    collider.CheckCollision(tilemap);
  }

  // Now that all colliders are registered, check
  // each one against the object filemap
  for (var i in this.colliders)
  {
    var collider = this.colliders[i];
    collider.CheckObjectCollision(this.colliderMap);
  }

  // Editor related things
  if (this.editorEnabled)
  {
    // Modify grid size
    this.editor.GetComponent("GridDraw").tileSize = this.tilemaps[this.activeLayer].tile_size;

    // Draw selected object
    if (this.selectedObject && TomatoJS.Core.GetGameObjectById(this.selectedObject.id))
    {
      var obj = this.selectedObject;
      var graphics = TomatoJS.Core.GetSystem("Graphics");
      var col = obj.GetComponent("TileCollider");
      var ren = obj.GetComponent("Renderable");
      var width = col ? col.width : (ren ? ren.image.width : 16);
      var height = col ? col.height : (ren ? ren.image.height : 16);
      this.selectedObjectSize = [width, height];
      graphics.AddDebugBox(obj.x - col.offsetX - width / 2, obj.y - col.offsetY - height / 2, width, height, "rgb(50, 200, 50)");
    }
    else
    {
      this.dragging = false;
    }
  }
}

TomatoJS.TileSystem.prototype.LoadLevelFromFile = function(fileName)
{
  var levelFile = TomatoJS.Core.resourceManager.GetLevel(fileName);
  var level = levelFile.GetJSONObject();
  this.LoadLevel(level);
}

TomatoJS.TileSystem.prototype.LoadLevel = function(level)
{
  this.ClearLevel();

  // Load tilemaps
  for (var i in level.tilemaps)
  {
    var tilemapData = level.tilemaps[i];
    var tileMap = (this.tilemaps[i] ? this.tilemaps[i] : new TomatoJS.TileMap());
    tileMap.layer = this.tilemaps.length;
    tileMap.Load(tilemapData);
    this.AddTileMap(tileMap);
  }

  // Load game objects
  this.editorObjects = {};
  for (var i in level.objects)
  {
    var levelObj = level.objects[i];
    var obj = TomatoJS.Core.LoadGameObject(levelObj.blueprint, true);
    obj.x = levelObj.x;
    obj.y = levelObj.y;
    this.editorObjects[obj.id] = levelObj;

    // Override with modified components
    for (var compName in levelObj.modifiedData)
    {
      for (var fieldName in levelObj.modifiedData[compName])
      {
        var comp = obj.GetComponent(compName);
        if (comp)
          comp[fieldName] = levelObj.modifiedData[compName][fieldName];
      }
    }

    obj.Initialize();
  }
}

TomatoJS.TileSystem.prototype.SaveLevel = function()
{
  var level = {};
  level.tilemaps = [];

  // Add tilemaps
  for (var i in this.tilemaps)
    level.tilemaps.push(this.tilemaps[i].Save());

  // Add objects
  level.objects = this.editorObjects;

  return level;
}

TomatoJS.TileSystem.prototype.ClearLevel = function()
{
  for (var i in this.tilemaps)
    this.RemoveTileMap(this.tilemaps[i]);

  for (var i in this.editorObjects)
    TomatoJS.Core.GetGameObjectById(i).Destroy();
  this.editorObjects = {};
}

TomatoJS.TileSystem.prototype.GetCollidersInRadius = function(x, y, radius)
{
  var tilemap = this.colliderMap;

  var startX = Math.floor((x - radius) / tilemap.tile_size);
  var startY = Math.floor((y - radius) / tilemap.tile_size);
  var endX = Math.floor((x + radius) / tilemap.tile_size);
  var endY = Math.floor((y + radius) / tilemap.tile_size);

  var colliders = {};

  for (var x = startX; x <= endX; ++x)
  {
    for (var y = startY; y <= endY; ++y)
    {
      var objects = tilemap.GetTile(x, y, tilemap.ObjectAttr);
      for (var i in objects)
        colliders[objects[i].parent.id] = objects[i];
    }
  }

  return colliders;
}

TomatoJS.TileSystem.prototype.RaycastToPoint = function(tilemap, x1, y1, x2, y2, testColliders, ignoredColliders, ignoreNonLightColliders)
{
  var dx = Math.abs(x2 - x1);
  var dy = Math.abs(y2 - y1);
  var sx = x1 < x2 ? 1 : -1;
  var sy = y1 < y2 ? 1 : -1;
  var err = dx - dy;
  var ep = 0.01;

  while (Math.abs(x2 - x1) > ep || Math.abs(y2 - y1) > ep)
  {
    if (sx > 0 && x1 > x2) break;
    if (sx < 0 && x1 < x2) break;
    if (sy > 0 && y1 > y2) break;
    if (sy < 0 && y1 < y2) break;

    // Check for intersection with colliders
    if (testColliders)
    {
      var objects = this.colliderMap.GetTileInWorld(x1, y1, tilemap.ObjectAttr);
      for (var n in objects)
      {
        var collider = objects[n];
        if (ignoredColliders && ignoredColliders[collider.parent.id])
          continue;
        if (ignoreNonLightColliders && !collider.stopsLight)
          continue;

        if (collider.CheckPointInside(x1, y1))
          return {"collision": true, "x": x1, "y": y1, "collider": collider};
      }
    }

    if (tilemap.GetTileInWorld(x1, y1, tilemap.CollisionAttr) == tilemap.SolidTile)
      return {"collision": true, "x": x1, "y": y1};

    var e2 = 2 * err;
    if (e2  > -dy)
    {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx)
    {
      err += dx;
      y1 += sy;
    }
  }

  return {"collision": false, "x": x1, "y": y1};
}

TomatoJS.TileSystem.prototype.InLineOfSight = function(tilemap, fromX, fromY, toX, toY, lookRadians, fov)
{
  var angleToPos = Math.atan2(toY - fromY, toX - fromX);

  var angleToPosLineX = Math.cos(angleToPos);
  var angleToPosLineY = Math.sin(angleToPos);

  var angleToLookLineX = Math.cos(lookRadians);
  var angleToLookLineY = Math.sin(lookRadians);

  var angleToFOVLine1X = Math.cos(lookRadians + fov / 2);
  var angleToFOVLine1Y = Math.sin(lookRadians + fov / 2);

  var angleToFOVLine2X = Math.cos(lookRadians - fov / 2);
  var angleToFOVLine2Y = Math.sin(lookRadians - fov / 2);

  var graphics = TomatoJS.Core.GetSystem("Graphics");
  graphics.AddDebugBox(toX, toY, 3, 3);
  graphics.AddDebugLine(fromX, fromY, fromX + angleToFOVLine1X * 40, fromY + angleToFOVLine1Y * 40);
  graphics.AddDebugLine(fromX, fromY, fromX + angleToFOVLine2X * 40, fromY + angleToFOVLine2Y * 40);

  var angle1 = Math.acos(angleToFOVLine1X * angleToPosLineX + angleToFOVLine1Y * angleToPosLineY);
  var angle2 = Math.acos(angleToFOVLine2X * angleToPosLineX + angleToFOVLine2Y * angleToPosLineY);
  var ep = 0.0001;
  if (Math.abs(fov - angle1 - angle2) > ep)
    return false;

  var intersect = this.RaycastToPoint(tilemap, fromX, fromY, toX, toY, true, {}, true);
  if (intersect.collision == true)
  {
    // graphics.AddDebugBox(intersect[0], intersect[1], 3, 3);
    return false;
  }

  // graphics.AddDebugLine(fromX, fromY, fromX + angleToPosLineX * 40, fromY + angleToPosLineY * 40);

  return true;
}

TomatoJS.TileSystem.prototype.BuildTileUI = function()
{
  var that = this;
  $('#ui-editor-tiles').empty();
  var ui = "";

  if (this.tilemaps.length == 0 || !this.tilemaps[this.activeLayer].tileset)
    return;

  var imageURL = "";
  imageURL = this.tilemaps[this.activeLayer].tileset.image.url;
  ui += "<img class='ui-tile' id='ui-tile' src='" + imageURL + "' />";
  ui += "<div id='ui-tile-select'></div>";

  $(ui).appendTo($('#ui-editor-tiles'));

  // Style
  $('#ui-tile-select').css({
    "width": + (that.tilemaps[that.activeLayer].tileset.tileWidth - 4) + "px",
    "height": + (that.tilemaps[that.activeLayer].tileset.tileHeight - 4) + "px",
    "left": $('.ui-tile').position().left + "px",
    "top": $('.ui-tile').position().top + "px",
    "background-color": "rgba(255, 150, 150, 0.0)",
    "position": "absolute",
    "border": "2px solid rgb(100, 100, 255)"
  });

  // Selecting a tile
  $('.ui-tile').bind("click", function(event)
  {
    var tileset = that.tilemaps[that.activeLayer].tileset;
    var pos = GetMousePos(event);
    pos.x = Math.floor(pos.x / tileset.tilesX);
    pos.y = Math.floor(pos.y / tileset.tilesY);
    that.activeTile = pos.x + pos.y * tileset.tilesX;

    $('#ui-tile-select').css("left", $('.ui-tile').position().left + pos.x * tileset.tileWidth + "px");
    $('#ui-tile-select').css("top", $('.ui-tile').position().top + pos.y * tileset.tileHeight + "px");
  });
}

TomatoJS.TileSystem.prototype.BuildPropUI = function()
{
  var that = this;
  $('#ui-editor-props').empty();

  if (!this.selectedObject || !TomatoJS.Core.GetGameObjectById(this.selectedObject.id))
    return;

  var ui = "<div class='ui-editor-prop-comp'>";
  var objectProperties = {};
  for (var i in this.selectedObject.components)
  {
    objectProperties[i] = {};
    var com = this.selectedObject.components[i];
    ui += "<h3>" + com.constructor.name + "</h3>";
    ui += "<div>";
    for (var j in com)
    {
      // Check if the field is an editable type
      if (com[j] == null || (com[j].substring || com[j].toFixed))
      {
        ui += "<div>" + j + " <input class='ui-object-field' id='ui-" + i + "-" + j + "'value='" + com[j] + "'>" + "</input></div>";
        objectProperties[i][j] = this.selectedObject.components[i][j];
      }
    }
    ui += "</div>";
  }
  ui += "</div>";

  $(ui).appendTo($('#ui-editor-props'));
  $(".ui-editor-prop-comp").accordion({ collapsible: true, autoHeight: false });

  // Add data to object property fields
  for (var i in objectProperties)
  {
    for (var j in objectProperties[i])
    {
      $("#ui-" + i + "-" + j).data("componentName", i);
      $("#ui-" + i + "-" + j).data("componentField", j);
    }
  }

  $('.ui-object-field').bind("change", function(event)
  {
    var componentName = $(this).data("componentName");
    var componentField = $(this).data("componentField");

    // Modify the current object
    that.selectedObject.GetComponent(componentName)[componentField] = $(this).val();
    that.selectedObject.Invoke("OnEdited");

    // Store modified data
    var editorObject = that.editorObjects[that.selectedObject.id];
    if (!editorObject.modifiedData)
      editorObject.modifiedData = {};

    if (!editorObject.modifiedData[componentName])
      editorObject.modifiedData[componentName] = {};

    editorObject.modifiedData[componentName][componentField] = $(this).val();
  });
}

TomatoJS.TileSystem.prototype.BuildUI = function()
{
  $("#editorui").remove();
  var ui = "<div id='editorui'>";

  // Main accordian
  ui += "<div id='ui-editor-main'>";

  // Tile palette
  ui += "<h3>Tiles</h3>";
  ui += "<div id='ui-editor-tiles'>";
  ui += "</div>";

  // Collision palette
  ui += "<h3>Collision</h3>";
  ui += "<div>";
  for (var i in collisionImage)
    ui += "<img class='ui-tile-collision' id='ui-tile-collision-" + i + "' src='" + collisionImage[i].url + "' />";
  ui += "</div>";

  // Get blueprint list
  var blueprintPath = TomatoJS.Core.configData["blueprintPath"];
  var objectListFile = TomatoJS.Core.fileManager.OpenFile(blueprintPath + "List.json");
  var objectList = objectListFile.GetJSONObject();

  // Object palette
  ui += "<h3>Objects <span id='ui-object-tile-name'></span></h3>";
  ui += " <div>";
  ui += "<img class='ui-tile-object' id='ui-tile-object-null" + "' src='" + collisionImage[0].url + "' width=" + collisionImage[0].width + " height=" + collisionImage[0].height + "' />";
  for (var i in objectList)
  {
    var blueprint = TomatoJS.Core.GetBlueprint(objectList[i]);
    if (blueprint.thumb)
      ui += "<img class='ui-tile-object' id='ui-tile-object-" + i + "' src='" + blueprint.thumb + "' max-width=16 max-height=16 />";
  }
  ui += "</div>";

  // Current layer selection
  ui += "<h3>Layer</h3>";
  ui += "<div>"
  ui += "<select class='ui-item' id='ui-layer-select' size=2>";
  for (var i in this.tilemaps)
    ui += "<option>" + i + "</option>";
  ui += "</select>";

  ui += "<div>Tilemap Size</div>";
  ui += "<input id='ui-tilemap-size'></input>";
  ui += "<div>Tilemap Tileset</div>";
  ui += "<input id='ui-tilemap-tileset'></input>";
  ui += "<p><div class='ui-button-big' id='ui-add-layer'>Add Layer</div></p>"
  ui += "<p><div class='ui-button-big' id='ui-remove-layer'>Remove Layer</div></p>"
  ui += "<p><div class='ui-button-big' id='ui-clear'>Clear Layer</div></p>";
  ui += "</div>"

  // Save / load section
  ui += "<h3>File</h3>";
  ui += "<div>";
  ui += "<p><div class='ui-button-big' id='ui-save'>Save</div></p>";
  ui += "<p><div class='ui-button-big' id='ui-load'>Load</div></p>";
  ui += "</div>";

  // Object editor
  ui += "<h3 id='ui-editor-prop-header'>Properties</h3>";
  ui += "<div id='ui-editor-props'>";

  ui += "</div>";

  // End of accordian
  ui += "</div>"

  // End of ui
  ui += "</div>"

  // Add the UI and style it
  var that = this;
  $(ui).dialog({autoOpen: true, title: "TomatoJS.Core Editor", position: [0, 0], "beforeClose": function(){that.DisableEditing()}});
  $('#ui-editor-main').accordion({ collapsible: true, autoHeight: false });
  $('.ui-button-big').button();
  $('.ui-button-small').button();
  this.BuildTileUI();
  $('#editorui').css({
      "height": "600px",
      "padding": "10px",
      "font-size": "14px",
      "font-family": "sans-serif",
      "overflow": "scroll"
  });
  $('.ui-item').css({
      "padding-top": "10px",
      "padding-bottom": "10px"
  });
  $('.ui-button-big').css({
      "display": "block",
      "font-weight": "bold",
      "text-align": "center",
      "line-height": "30px",
      "margin": "auto"
  });
  $('.ui-button-small').css({
      "margin": "auto"
  });
  $('#ui-tilemap-size').css({
      "font-weight": "bold",
      "text-align": "center"
  });
  $('#ui-layer-select').css({
    "width": "100%"
  });

  // Add data to tile images
  for (var i in collisionImage)
    $("#ui-tile-collision-" + i).data("tileID", i);
  for (var i in objectList)
    $("#ui-tile-object-" + i).data("tileID", i);
  $("#ui-tile-object-null").data("tileID", null);

  // Selecting a collision
  $('.ui-tile-collision').bind("click", function(event)
  {
    that.activeCollision = $(this).data("tileID");
    for (var i in collisionImage)
      $("#ui-tile-collision-" + i).css({"border": "none"});
    $(this).css({
      "border": "solid 2px",
      "border-color": "rgb(100, 100, 255)"
    });
  });

  // Selecting an object
  $('.ui-tile-object').bind("click", function(event)
  {
    var tileID = $(this).data("tileID");
    if (tileID != null)
      that.activeObject = objectList[tileID];
    else
      that.activeObject = null;
    if (that.activeObject != null)
      $("#ui-object-tile-name").text(that.activeObject);
    else
      $("#ui-object-tile-name").text("none");
    for (var i in objectList)
      $("#ui-tile-object-" + i).css({"border": "none"});
    $("#ui-tile-object-null").css({"border": "none"});
    $(this).css({
      "border": "solid 2px",
      "border-color": "rgb(100, 100, 255)"
    });
  });

  // Selecting a layer
  $('#ui-layer-select').bind("change", function(event)
  {
    that.activeLayer = $(this).prop("selectedIndex");
    $('#ui-tilemap-size').val(that.tilemaps[that.activeLayer].tile_size);
    that.BuildTileUI();
  });

  // Choosing layer size
  $('.ui-spinner-button').click(function(event)
  {
    $(this).siblings('input').change();
  });
  $('#ui-tilemap-size').val(that.tilemaps[that.activeLayer].tile_size);
  $('#ui-tilemap-size').bind("change", function(event)
  {
    that.tilemaps[that.activeLayer].tile_size = $(this).val();
  });

  // Choosing layer tileset
  $('#ui-tilemap-tileset').val(that.tilemaps[that.activeLayer].tilesetPath);
  $('#ui-tilemap-tileset').bind("change", function(event)
  {
    that.tilemaps[that.activeLayer].SetTileset($(this).val());
    that.BuildTileUI();
  });

  // Adding / removing a layer
  $('#ui-add-layer').bind("click", function(event)
  {
    that.AddTileMap(new TomatoJS.TileMap());
    $('#ui-tilemap-size').val(that.tilemaps[that.activeLayer].tile_size);
  });
  $('#ui-remove-layer').bind("click", function(event)
  {
    var index = $('#ui-layer-select').prop("selectedIndex")
    if (that.tilemaps.length > 0)
      that.RemoveTileMap(that.tilemaps[index]);
    $('#ui-tilemap-size').val(that.tilemaps[that.activeLayer].tile_size);
  });

  // Clearing and saving
  $('#ui-clear').bind("click", function(event)
  {
    that.ClearLevel();
  });
  $('#ui-save').bind("click", function(event)
  {
    var level = that.SaveLevel();
    var levelText = JSON.stringify(level);
    TomatoJS.Core.fileManager.WriteFile("/test.lvl", levelText);
  });
  $('#ui-load').bind("click", function(event)
  {
    TomatoJS.Core.fileManager.OpenFileDialog(function(filePath)
    {
      that.LoadLevelFromFile(filePath);
    }, TomatoJS.Core.configData["levelPath"]);
  });
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));