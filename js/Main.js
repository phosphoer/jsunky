function main()
{
  // Create engine
  var engine = new TomatoJS.Engine();

  // Add systems
  engine.AddSystem("Game");
  // engine.AddSystem("TextLog");
  engine.AddSystem("TileSystem");
  // engine.AddSystem("Lighting");
  engine.AddSystem("Graphics");

  // TomatoJS.Core.GetSystem("Graphics").debugDrawEnabled = true;

  // Start game
  engine.Start();
}