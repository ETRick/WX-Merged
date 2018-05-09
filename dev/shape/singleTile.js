const Tile = require("./tile.js");
const util = require('../utils/util.js');
const CONSTS = require("../consts.js");
const BOX_WIDTH = CONSTS.BOX_WIDTH;

var SingleTile = (function () {
  function SingleTile(x, y, value) {
    this.x = x;
    this.y = y;
    this.tiles = [new Tile(0, 0, value)];
    this.values = [value || 1];
    this.currentAngle = 0;    //degree
    this.currentScale = 1;
    this.moveData = null;
    this.rotateData = null;
  }

  SingleTile.prototype = {
    draw: function (ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.currentAngle * Math.PI / 180);
      for (var i = 0; i < this.tiles.length; i++) {
        this.tiles[i].draw(ctx, true);
      }
      ctx.restore();
    },

    growUp: function () {
      this.currentScale = 0.3;
      let startTime = util.getTimeNow();
      let scaleData = {
        destScale: 1,
        startScale: this.currentScale,
        lastTime: startTime,
        startTime: startTime,
        duration: 200,
        callback: null,
      };
      this.scaleData = scaleData;
    },

    update: function () {
      let time = util.getTimeNow();
      let moveData = this.moveData;
      if (moveData) {
        // 检测是否已经完成
        if (moveData.lastTime > moveData.startTime + moveData.duration) {
          moveData.callback && moveData.callback();
          this.moveData = null;
        } else {
          let elapsedTime = time - moveData.startTime;
          var ratio = elapsedTime / moveData.duration;
          ratio = Math.min(1, ratio);
          let nextX = moveData.startX + (moveData.destX - moveData.startX) * ratio;
          let nextY = moveData.startY + (moveData.destY - moveData.startY) * ratio;
          this.setPos(nextX, nextY);
          moveData.lastTime = time;
        }
      }

      let rotateData = this.rotateData;
      if (rotateData) {
        // 检测是否已经完成
        if (rotateData.lastTime > rotateData.startTime + rotateData.duration) {
          rotateData.callback && rotateData.callback();
          this.rotateData = null;
        } else {
          let elapsedTime = time - rotateData.startTime;
          var ratio = elapsedTime / rotateData.duration;
          ratio = Math.min(1, ratio);
          let nextAngle = rotateData.startAngle + (rotateData.destAngle - rotateData.startAngle) * ratio;
          this.setAngle(nextAngle);
          rotateData.lastTime = time;
        }
      }

      let scaleData = this.scaleData;
      if (scaleData) {
        // 检测是否已经完成
        if (scaleData.lastTime > scaleData.startTime + scaleData.duration) {
          scaleData.callback && scaleData.callback();
          this.scaleData = null;
        } else {
          let elapsedTime = time - scaleData.startTime;
          var ratio = elapsedTime / scaleData.duration;
          ratio = Math.min(1, ratio);
          let nextScale = scaleData.startScale + (scaleData.destScale - scaleData.startScale) * ratio;
          this.setScale(nextScale);
          scaleData.lastTime = time;
        }
      }
    },

    setValue: function (value) {
      this.vaue = value;
    },

    setAngle: function (angle) {
      this.currentAngle = angle;
    },

    setScale: function (scale) {
      this.currentScale = scale;
      this.tiles[0].setScale(scale);
    },

    setPos: function (x, y) {
      this.x = x;
      this.y = y;
    },

    inBound: function (posX, posY) {
      if (!this.canTouch())
        return false;

      if (posX > this.x + this.width * 0.5)
        return false;
      if (posX < this.x - this.width * 0.5)
        return false;
      if (posY > this.y + this.height * 0.5)
        return false;
      if (posY < this.y - this.height * 0.5)
        return false;

      return true;
    },

    moveTo: function (x, y, duration, callback) {
      if (this.moveData) {
        // TODO 结束上一次的moveData
      }
      let startTime = util.getTimeNow();
      let moveData = {
        destX: x,
        destY: y,
        startX: this.x,
        startY: this.y,
        lastTime: startTime,
        startTime: startTime,
        duration: duration,
        callback: callback,
      };

      this.moveData = moveData;
    },

    move: function (x, y, duration, callback) {
      this.moveTo(this.x + x, this.y + y, duration, callback);
    },

    rotateTo: function (angle, duration, callback) {
      //单个棋子不旋转
      return;
      if (this.rotateData) {
        // TODO 结束上一次的rotateData
      }
      let startTime = util.getTimeNow();
      let rotateData = {
        startAngle: this.currentAngle,
        destAngle: angle,
        lastTime: startTime,
        startTime: startTime,
        duration: duration,
        callback: callback,
      };
      this.rotateData = rotateData;
    },

    rotate: function (angle, duration, callback) {
      this.rotateTo(this.currentAngle + angle, duration, callback);
    },

    canTouch: function () {
      if (this.rotateData) {
        return false;
      }
      return true;
    },

    getAllSingleOneRelativePoses: function () {
      return [{ x: 0, y: 0 }];
    }
  }

  return SingleTile;
}());

module.exports = SingleTile;