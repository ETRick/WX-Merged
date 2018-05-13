/**
 * TODO animation 最好给一个canvas绘制后的回调，尽量避免闪的感觉
 */
const util = require('../utils/util.js');

var AnimationController = {

  currentAnimations: [],

  startAnimation: function (mergeAnimation) {
    mergeAnimation.startTime = mergeAnimation.startTime = util.getTimeNow();
    this.currentAnimations.push(mergeAnimation);
  },

  isEmpty: function(){
    return this.currentAnimations.length === 0;
  },

  update: function () {
    var completeIndexList = [];
    for (var i = 0; i < this.currentAnimations.length; i++) {
      if (this.currentAnimations[i].isComplete()) {
        this.currentAnimations[i].complete();
        completeIndexList.push(i);
      } else {
        this.currentAnimations[i].update();
      }

      this.currentAnimations[i].lastTime = util.getTimeNow();
    }

    for (var i = completeIndexList.length - 1; i >= 0; i--) {
      this.currentAnimations.splice(completeIndexList[i], 1);
    }
  },

  draw: function (ctx) {
    for (var i = 0; i < this.currentAnimations.length; i++) {
      this.currentAnimations[i].draw(ctx);
    }
  }
}

module.exports = AnimationController;