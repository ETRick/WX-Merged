const shapeHelper = require("../shape/shapeHelper.js");
const util = require('../utils/util.js');
const CONSTS = require("../consts.js");
const Tween = require("../utils/tween.js");
const BOX_WIDTH = CONSTS.BOX_WIDTH;
const ITEM_WIDTH = CONSTS.ITEM_WIDTH;

var ExploreShape = (function () {
  function ExploreShape(rgbColor) {
    this.x = 187.5;
    this.y = 300;
    this.rgbColor = rgbColor;
    this.currentScale = 0;
    this.generateGradientColors();
    this.scaleData = null;

    this.scaleTo(1, 2000, Tween.backOut);
  }

  ExploreShape.prototype = {

    scaleTo: function (destScale, duration, ease, callback) {
      if (this.scaleData) {
        // TODO 结束上一次的rotateData
      }
      let startTime = util.getTimeNow();
      let scaleData = {
        startValue: this.currentScale,
        destValue: destScale,
        lastTime: startTime,
        startTime: startTime,
        duration: duration,
        callback: callback,
        changeValue: destScale - this.currentScale,
        ease: ease || Tween.linear,
      };
      this.scaleData = scaleData;
    },

    // TODO scaleData 等data封装，tween调用封装
    update: function () {
      let time = util.getTimeNow();

      let scaleData = this.scaleData;
      if (scaleData) {
        // 检测是否已经完成
        if (scaleData.lastTime > scaleData.startTime + scaleData.duration) {
          scaleData.callback && scaleData.callback();
          this.scaleData = null;
        } else {
          var elapsedTime = Math.min(time - scaleData.startTime, scaleData.duration);
          let nextScale = scaleData.ease(elapsedTime, scaleData.startValue, scaleData.changeValue, scaleData.duration);
          this.setScale(nextScale);
          scaleData.lastTime = time;
        }
      }
    },

    setScale: function (scale) {
      this.currentScale = scale;
    },

    generateGradientColors: function () {
      this.gradientColors = [`rgba(${this.rgbColor.r}, ${this.rgbColor.g}, ${this.rgbColor.b}, 0)`,
      `rgba(${this.rgbColor.r}, ${this.rgbColor.g}, ${this.rgbColor.b}, 0.4)`,
      `rgba(${this.rgbColor.r}, ${this.rgbColor.g}, ${this.rgbColor.b}, 0.9)`];
    },

    draw: function (ctx) {
      const grd = ctx.createCircularGradient(1.5 * ITEM_WIDTH, 1.5 * ITEM_WIDTH, 2 * ITEM_WIDTH)
      grd.addColorStop(0, this.gradientColors[0]);
      grd.addColorStop(0.6, this.gradientColors[1]);
      grd.addColorStop(1, this.gradientColors[2]);
      ctx.setFillStyle(grd);

      ctx.beginPath();
      ctx.translate(this.x, this.y);
      ctx.scale(this.currentScale, this.currentScale);
      ctx.translate(- 1.5 * ITEM_WIDTH, - 1.5 * ITEM_WIDTH);
      // ctx.fillRect(0, 0, ITEM_WIDTH * 3, ITEM_WIDTH * 3, 50);
      shapeHelper.fillRoundRect(ctx, ITEM_WIDTH * 3, ITEM_WIDTH * 3, 50);
      ctx.closePath();
      ctx.restore();
    }
  }
  return ExploreShape;
}());

module.exports = ExploreShape;