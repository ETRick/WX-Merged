const Shapes = require('../shape/shapes.js');
const util = require('../utils/util.js');
const Single = Shapes.Single;

var ComposedAnimation = {

  // 合成的动画
  MergeAnimation: (function () {
    function MergeAnimation(centerTile, moveTiles, duration, callback) {
      this.center = centerTile;
      this.moveTiles = moveTiles;
      this.callback = callback;
      this.duration = duration;
      this.startTime = util.getTimeNow();
      this.lastTime = this.startTime;

      for(var i =0; i < moveTiles.length; i++){
        moveTiles[i].moveTo(centerTile.x, centerTile.y, duration);
      }
    }

    MergeAnimation.prototype = {
      update:function(){
        let moveTiles = this.moveTiles;
        let centerTile = this.center;
        for (var j = 0; j < moveTiles.length; j++) {
          moveTiles[j].update();
        }
        centerTile.update();
        this.lastTime = util.getTimeNow();
      },

      draw: function (ctx){
        let moveTiles = this.moveTiles;
        let centerTile = this.center;
        for (var j = 0; j < moveTiles.length; j++) {
          moveTiles[j].draw(ctx);
        }

        centerTile.draw(ctx);
      },

      isComplete: function(){
        let lastTime = this.lastTime;
        let duration = this.duration;
        let startTime = this.startTime;
        if(lastTime > startTime + duration){
          return true;
        }else{
          return false;
        }
      },

      complete: function(){
        this.callback && this.callback();
      }
    };
    return MergeAnimation
  }()),

  ExploreAnimation: (function(){
    function ExploreAnimation(x, y, duration, callback){
      this.x = x;
      this.y = y;
      this.duration = duration;
      this.callback= callback;
    }

    ExploreAnimation.prototype = {
      update: function(){

      },

      draw: function(){

      },

      isComplete: function(){
        let lastTime = this.lastTime;
        let duration = this.duration;
        let startTime = this.startTime;
        if (lastTime > startTime + duration) {
          return true;
        } else {
          return false;
        }
      },

      complete: function(){
        this.callback && this.callback();
      }
    }
  }()),

  animationController: {

    mergeAnimations: [],

    /**
     * option:{
     *  center: Single
     *  moveTiles: [Single]
     *  duration,
     *  callback,
     * }
     */
    startMergeAnimation: function (mergeAnimation) {
      this.mergeAnimations.push(mergeAnimation);
    },

    update: function () {
      var completeIndexList = [];
      for (var i = 0; i < this.mergeAnimations.length; i++){
        if(this.mergeAnimations[i].isComplete()){
          this.mergeAnimations[i].complete();
          completeIndexList.push(i);
        }else{
          this.mergeAnimations[i].update();
        }
      }

      for (var i = completeIndexList.length - 1; i>=0; i--){
        this.mergeAnimations.splice(completeIndexList[i], 1);
      }
    },

    draw: function (ctx) {
      for (var i = 0; i < this.mergeAnimations.length; i++) {
        this.mergeAnimations[i].draw(ctx);
      }
    }
  }
}




module.exports = ComposedAnimation;