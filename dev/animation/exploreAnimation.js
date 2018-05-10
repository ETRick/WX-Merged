const ExploreShape = require("../shape/exploreShape.js");
const util = require('../utils/util.js');
const Tween = require("../utils/tween.js");

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
    this.startTime = util.getTimeNow();
    this.lastTime = this.startTime;
    this.duration = duration || 1000;

    this.exploredCount = 0;

    this.shapes = [
      new ExploreShape(EXPLOR_SAHPE_COLORS[0]),
      new ExploreShape(EXPLOR_SAHPE_COLORS[1]),
      new ExploreShape(EXPLOR_SAHPE_COLORS[2])
    ];

    this.shapes.forEach((s) => {
      s.x = this.x;
      s.y = this.y;
    })

    this.shapes[0].scaleTo(0, 1, this.duration, Tween.backOut);
    this.shapes[1].scaleTo(this.duration * 0.2, 0.8, this.duration * 0.8, Tween.backOut);
    this.shapes[2].scaleTo(this.duration * 0.4, 0.65, this.duration * 0.6, Tween.backOut);

  }

  ExploreAnimation.prototype = {
    update: function () {
      this.shapes.forEach((s) => {
        s.update();
      });
    },

    draw: function (ctx) {
      ctx.save();
      let alpha = 1 - Math.max((util.getTimeNow() - this.startTime) / this.duration);
      alpha = Math.max(alpha, 0);
      ctx.setGlobalAlpha(alpha);
      let index = 1;
      this.shapes.forEach((s) => {
        s.draw(ctx);
      });

      ctx.restore();
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