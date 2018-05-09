const ExploreShape = require("../shape/exploreShape.js");
var EXPLOR_SAHPE_COLORS = [
  { r: 254, g: 67, b: 101 },
  { r: 250, g: 218, b: 141 },
  { r: 35, g: 233, b: 185 },
]

const exploreTime = 200;

var ExploreAnimation = (function () {
  function ExploreAnimation(x, y, duration, callback) {
    this.x = x;
    this.y = y;
    this.duration = duration;
    this.callback = callback;

    this.exploreCount = 0;

    this.shapes = [
      new ExploreShape(EXPLOR_SAHPE_COLORS[0])
      // new ExploreShape(EXPLOR_SAHPE_COLORS[1]),
      // new ExploreShape(EXPLOR_SAHPE_COLORS[2])
    ];
  }

  ExploreAnimation.prototype = {
    update: function () {
      this.shapes.forEach((s) => {
        s.update();
      });
    },

    draw: function (ctx) {
      this.shapes.forEach((s)=>{
        s.draw(ctx);
      });
    },

    complete: function () {
      this.callback && this.callback();
    },

    isComplete: function () {
      let lastTime = this.lastTime;
      let duration = this.duration;
      let startTime = this.startTime;
      if (lastTime > startTime + duration) {
        return true;
      } else {
        return false;
      }
    },

    complete: function () {
      this.callback && this.callback();
    }
  }

  return ExploreAnimation;
}())

module.exports = ExploreAnimation