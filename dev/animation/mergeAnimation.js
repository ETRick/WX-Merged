const util = require('../utils/util.js');

// 合成的动画
var MergeAnimation = (function () {
  function MergeAnimation(centerTile, moveTiles, duration, callback) {
    this.center = centerTile;
    this.moveTiles = moveTiles;
    this.callback = callback;
    this.duration = duration;

    for (var i = 0; i < moveTiles.length; i++) {
      moveTiles[i].moveTo(centerTile.x, centerTile.y, duration);
    }
  }

  MergeAnimation.prototype = {
    update: function () {
      let moveTiles = this.moveTiles;
      let centerTile = this.center;
      for (var j = 0; j < moveTiles.length; j++) {
        moveTiles[j].update();
      }
      centerTile.update();
    },

    draw: function (ctx) {
      let moveTiles = this.moveTiles;
      let centerTile = this.center;
      for (var j = 0; j < moveTiles.length; j++) {
        moveTiles[j].draw(ctx);
      }

      centerTile.draw(ctx);
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
  };
  return MergeAnimation
}())

module.exports = MergeAnimation;