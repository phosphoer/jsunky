(function (TomatoJS, $, undefined)
{

TomatoJS.Rand = function(a, b)
{
  if (!a || !b)
    return Math.random();

  return a + Math.random() * (b - a);
}

TomatoJS.NormalizeInRange = function(a, b, t)
{
  var c = (t - a) / (b - a);
  c = Math.max(c, 0);
  c = Math.min(c, 1);
  return c;
}

TomatoJS.Lerp = function(a, b, t)
{
  return (1 - t) * a + b * t;
}

TomatoJS.Vec2Add = function(v1, v2)
{
  return [v1[0] + v2[0], v1[1] + v2[1]];
}

TomatoJS.Vec2Subtract = function(v1, v2)
{
  return [v1[0] - v2[0], v1[1] - v2[1]];
}

TomatoJS.Vec2Dot = function(v1, v2)
{
  return v1[0] * v2[0] + v1[1] * v2[1];
}

TomatoJS.Vec2Scale = function(v, s)
{
  return [v[0] * s, v[1] * s];
}

TomatoJS.Vec2Length = function(v)
{
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

TomatoJS.Vec2LengthSquared = function(v)
{
  return v[0] * v[0] + v[1] * v[1];
}

TomatoJS.Vec2FromAngle = function(angle)
{
  return [Math.cos(angle), Math.sin(angle)];
}

TomatoJS.Vec2Normalize = function(v)
{
  var length = Vec2Length(v);
  if (length < 0.0001)
    return;
  v[0] /= length;
  v[1] /= length;
}

TomatoJS.Vec2Normalized = function(v)
{
  var length = Vec2Length(v);
  if (length < 0.0001)
    return [0, 0];
  return Vec2Scale(v, 1 / length);
}

TomatoJS.Vec2ProjectLine = function(point, lineBegin, lineDir)
{
  var pointToLine = Vec2Subtract(point, lineBegin);
  var length = Vec2LengthSquared(lineDir);
  if (length == 0)
    return [lineBegin[0], lineBegin[1]];

  var scalar = Vec2Dot(pointToLine, Vec2Scale(lineDir, 1 / length));
  return Vec2Add(lineBegin, Vec2Scale(lineDir, scalar));
}

TomatoJS.Vec2DistancePoint = function(pointA, pointB)
{
  return Math.sqrt((pointB[0] - pointA[0]) * (pointB[0] - pointA[0]) + (pointB[1] - pointA[1]) * (pointB[1] - pointA[1]));
}

TomatoJS.Vec2DistanceLine = function(point, lineBegin, lineDir)
{
  var project = Vec2ProjectLine(point, lineBegin, lineDir);
  return Vec2DistancePoint(point, project);
}

TomatoJS.Vec2ContainedInRect = function(point, rectPos, rectSize)
{
  if (point[0] < rectPos[0] || point[1] < rectPos[1])
    return false;

  if (point[0] > rectPos[0] + rectSize[0] || point[1] > rectPos[1] + rectSize[1])
    return false;

  return true;
}

TomatoJS.IntersectLineSegments = function(a1, a2, b1, b2, intersect)
{
  var b = [a2[0] - a1[0], a2[1] - a1[1]];
  var d = [b2[0] - b1[0], b2[1] - b1[1]];
  var cross = b[0] * d[1] - b[1] * d[0];

  if (cross == 0)
    return false;

  var c = [b1[0] - a1[0], b1[1] - a1[1]];
  var t = (c[0] * d[1] - c[1] * d[0]) / cross;
  if (t < 0 || t > 1)
    return false;

  var u = (c[0] * b[1] - c[1] * b[0]) / cross;
  if (u < 0 || u > 1)
    return false;

  intersect[0] = a1[0] + t * b[0];
  intersect[1] = a1[1] + t * b[1];

  return true;
}

TomatoJS.AngleDistance = function(angleA, angleB)
{
  angleA %= Math.PI * 2;
  angleB %= Math.PI * 2;

  if (angleA < 0) angleA += Math.PI * 2;
  if (angleB < 0) angleB += Math.PI * 2;

  if (Math.abs(angleB - angleA) < Math.PI)
    return angleB - angleA;

  if (angleB > Math.PI)
  {
    angleA += Math.PI;
    angleB -= Math.PI;
    return angleB - angleA;
  }

  angleA -= Math.PI;
  angleB += Math.PI;
  return angleB - angleA;
}

} (window.TomatoJS = window.TomatoJS || {}, jQuery));