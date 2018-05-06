const util = require('../utils/util.js');
var Shapes = {};

const COLORS = require("../utils/colors.js");
const getColorByValue = COLORS.getColorByValue;
const getTileImgSrcByValue = COLORS.getTileImgSrcByValue;
const VALUE_COLORS = COLORS.VALUE_COLORS;

const ROUND_CAP_SIZE = util.rpx2px(20);

// 绘制圆角矩形
var fillRoundRect = function (cxt, width, height, radius) {
  //圆的直径必然要小于矩形的宽高          
  if (2 * radius > width || 2 * radius > height) { return false; }

  // 绘制圆角矩形的各个边 path
  cxt.beginPath(0);
  //从右下角顺时针绘制，弧度从0到1/2PI  
  cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
  //矩形下边线  
  cxt.lineTo(radius, height);
  //左下角圆弧，弧度从1/2PI到PI  
  cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
  //矩形左边线  
  cxt.lineTo(0, radius);
  //左上角圆弧，弧度从PI到3/2PI  
  cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);
  //上边线  
  cxt.lineTo(width - radius, 0);
  //右上角圆弧  
  cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);
  //右边线  
  cxt.lineTo(width, height - radius);
  cxt.closePath();

  cxt.fill();
}

Shapes.Single = (function () {
  function Single(x, y, width, height, value) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.value = value || 1;
    this.values = [this.value];
    this.currentAngle = 0;    //degree
    this.currentScale = 1;
    this.moveData = null;
    this.rotateData = null;
  }

  Single.prototype = {
    draw: function (ctx, isParentMatrix) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.currentScale, this.currentScale);
      ctx.rotate(this.currentAngle * Math.PI / 180);
      ctx.translate(- 0.5 * this.width, - 0.5 * this.height);
      // ctx.setFillStyle("white");
      ctx.drawImage(getTileImgSrcByValue(this.value), 0, 0, this.width, this.height);
      // ctx.setFillStyle(getColorByValue(this.value));
      // ctx.fillRect(0, 0, this.width, this.height);
      // fillRoundRect(ctx, this.width, this.height, ROUND_CAP_SIZE);
      ctx.translate(0.5 * this.width, 0.5 * this.height);
      if (isParentMatrix) {
        ctx.rotate(-this.currentAngle * Math.PI / 180 * 2);
      } else {
        ctx.rotate(-this.currentAngle * Math.PI / 180);
      }
      // ctx.setFillStyle("black");
      // ctx.fillText(this.value);
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

  return Single;
}());

Shapes.Pair = (function () {
  function Pair(x, y, width, height, boxWidth, value1, value2) {
    this.x = x;
    this.y = y;
    this.boxWidth = boxWidth;
    this.isVertical = false;
    this.currentAngle = 0;    //degree
    this.currentScale = 1;
    this.moveData = null;
    this.rotateData = null;
    this.values = [value1, value2];

    this.singles = [];
    this.singles.push(new Shapes.Single(- 0.5 * boxWidth, 0, width, height, value1));
    this.singles.push(new Shapes.Single(0.5 * boxWidth, 0, width, height, value2));
  }

  Pair.prototype = {
    draw: function (ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.currentAngle * Math.PI / 180);
      for (var i = 0; i < this.singles.length; i++) {
        this.singles[i].draw(ctx, true);
      }
      ctx.restore();
    },

    growUp: function () {
      let startTime = util.getTimeNow();
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
      this.singles[0].setAngle(childAngle);
      this.singles[1].setAngle(childAngle);
    },

    setScale: function (scale) {
      this.currentScale = scale;
      this.singles[0].setScale(scale);
      this.singles[1].setScale(scale);
    },

    setPos: function (x, y) {
      this.x = x;
      this.y = y;
    },

    inBound: function (posX, posY) {
      if (!this.canTouch())
        return false;

      if (this.isVertical) {
        if (posX > this.x + this.boxWidth * 0.5)
          return false;
        if (posX < this.x - this.boxWidth * 0.5)
          return false;
        if (posY > this.y + this.boxWidth)
          return false;
        if (posY < this.y - this.boxWidth)
          return false;
      } else {
        if (posX > this.x + this.boxWidth)
          return false;
        if (posX < this.x - this.boxWidth)
          return false;
        if (posY > this.y + this.boxWidth * 0.5)
          return false;
        if (posY < this.y - this.boxWidth * 0.5)
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
      let singleOffset = 0.5 * this.boxWidth;

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

  return Pair;
}());

module.exports = Shapes;