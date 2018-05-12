
var distance = function (posA, posB) {
  let a = Math.pow(posA.x - posB.x, 2);
  let b = Math.pow(posA.y - posB.y, 2);
  return Math.pow(a + b, 0.5);
}

var lerp = function (fromValue, toValue, coefficient){
  return fromValue + (toValue - fromValue) * coefficient;
}

module.exports = { distance, lerp }
