const Tile = require("./tile.js");
const util = require('../utils/util.js');
const CONSTS = require("../consts.js");
const BOX_WIDTH = CONSTS.BOX_WIDTH;

var PairTile = (function () {
  function PairTile(x, y, value1, value2) {
    this.x = x;
    this.y = y;
    this.isVertical = false;
    this.currentAngle = 0;    //growUp
    this.currentScale = 1;
    this.moveData = null;
    this.rotateData = null;
    this.values = [value1, value2];

    this.tiles = [];
    this.tiles.push(new Tile(- 0.5 * BOX_WIDTH, 0, value1));
    this.tiles.push(new Tile(0.5 * BOX_WIDTH, 0, value2));
  }

  PairTile.prototype = {
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
      let startTime = util.getTimeNow();
      this.currentScale = 0;
      let scaleData = {
        destScale: 1,
        startScale: 0,
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
      let childAngle = -angle;
      this.tiles[0].setAngle(childAngle);
      this.tiles[1].setAngle(childAngle);
    },

    setScale: function (scale) {
      this.currentScale = scale;
      this.tiles[0].setScale(scale);
      this.tiles[1].setScale(scale);
    },

    setPos: function (x, y) {
      this.x = x;
      this.y = y;
    },

    inBound: function (posX, posY) {
      if (!this.canTouch())
        return false;

      if (this.isVertical) {
        if (posX > this.x + BOX_WIDTH * 0.5)
          return false;
        if (posX < this.x - BOX_WIDTH * 0.5)
          return false;
        if (posY > this.y + BOX_WIDTH)
          return false;
        if (posY < this.y - BOX_WIDTH)
          return false;
      } else {
        if (posX > this.x + BOX_WIDTH)
          return false;
        if (posX < this.x - BOX_WIDTH)
          return false;
        if (posY > this.y + BOX_WIDTH * 0.5)
          return false;
        if (posY < this.y - BOX_WIDTH * 0.5)
          return false;
      }

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
      this.isVertical = !this.isVertical;
      this.rotateTo(this.currentAngle + angle, duration, callback);
    },

    canTouch: function () {
      if (this.rotateData) {
        return false;
      }
      return true;
    },

    getAllSingleOneRelativePoses: function () {
      var result = [];
      var relativeX, relativeY;
      let singleOffset = 0.5 * BOX_WIDTH;

      if (this.currentAngle / 90 % 4 == 0) {
        result.push({ x: -singleOffset, y: 0 });
        result.push({ x: singleOffset, y: 0 });
      }
      if (this.currentAngle / 90 % 4 == 1) {
        result.push({ x: 0, y: -singleOffset });
        result.push({ x: 0, y: singleOffset });
      }

      if (this.currentAngle / 90 % 4 == 2) {
        result.push({ x: singleOffset, y: 0 });
        result.push({ x: -singleOffset, y: 0 });
      }

      if (this.currentAngle / 90 % 4 == 3) {
        result.push({ x: 0, y: singleOffset });
        result.push({ x: 0, y: -singleOffset });
      }

      return result;
    }
  }

  return PairTile;
}());


module.exports = PairTile