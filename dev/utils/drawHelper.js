let util = require("./util.js")
const TILE_SIZE = util.rpx2px(130);
const HALF_ITEM_SIZE = util.rpx2px(70);
const ROUND_CAP_SIZE = util.rpx2px(10);

/**获取当前时间 */
var getTimeNow = function () {
  return +new Date();
};

/**
   使用示例
   let ctx = wx.createCanvasContext("animation-canvas", this);
    this.drawHelper = new DrawHelper(60, ctx);
    let drawHelper = this.drawHelper;
    setTimeout(()=>{
      drawHelper.addAnimationInfo(
        {
          duration: 1000,
          center: {
           x: 1,
           y: 1,
           color: "red",
           text: "234"
          },
          moveTiles:[
            {
              x: 200,
              y: 200,
              color: "red",
              text: "234",
              destX: 400,
              destY:500,
            }
          ],
          caller: this,
          callback: function(){
            console.log("callback");
          }
        });

    }, 300);
 */
var DrawHelper = (function () {
  function DrawHelper(frameRate, ctx) {
    this.dirty = false;
    this.frameInterval = 1000 / frameRate;  // 一帧的时间

    this.ctx = ctx;
    //初始化text的设置(手机上这里初始化不行，所以每次绘制都初始化一次)
    this.initTextSetting();
    this.animationDatas = []; // 当前存在的动画信息

    this.animationFrame(this.update);
  }

  // 帧控制
  DrawHelper.prototype.animationFrame = function (callback) {
    var that = this;
    setTimeout(function () {
      callback.call(that);
    }, this.frameInterval);
  }

  // 设置text显示
  DrawHelper.prototype.initTextSetting = function () {
    this.ctx.setFontSize(util.rpx2px(70));
    this.ctx.setTextAlign("center");
    this.ctx.setTextBaseline("middle");
    this.ctx.setLineCap('round');
  }

  /** 增加动画信息
   * taskInfo:{
   *  center:{
   *    x,
   *    y,
   *    color,
   *    text
   *  },
   *  moveTiles:[
   *    {
   *      x,
   *      y,
   *      color,
   *      text,
   *      destX,
   *      dextY
   *     }
   *  ],
   *  duration,
   *  callback,
   *  caller
   * }
   */
  DrawHelper.prototype.addAnimationInfo = function (animationInfo) {
    let time = getTimeNow();
    let animationData = {
      startTime: time,
      lastTime: time,
      duration: animationInfo.duration,
      caller: animationInfo.caller,
      callback: animationInfo.callback
    };
    // 中间的tile
    let centerOne = animationInfo.center;
    if (centerOne) {
      let x = util.rpx2px(centerOne.x - HALF_ITEM_SIZE);
      let y = util.rpx2px(centerOne.y - HALF_ITEM_SIZE)
      animationData.centerTile = new Tile(x, y, centerOne.color, centerOne.text);
    }

    // 移动的tile
    let moveTiles = animationInfo.moveTiles;
    if (moveTiles && moveTiles.length > 0) {
      animationData.moveTiles = [];
      for (var i = 0; i < moveTiles.length; i++) {
        let tileInfo = moveTiles[i];
        let x = util.rpx2px(tileInfo.x - HALF_ITEM_SIZE);
        let y = util.rpx2px(tileInfo.y - HALF_ITEM_SIZE);
        let destX = util.rpx2px(tileInfo.destX - HALF_ITEM_SIZE);
        let destY = util.rpx2px(tileInfo.destY - HALF_ITEM_SIZE);
        let tile = new Tile(x, y, tileInfo.color, tileInfo.text, destX, destY);
        animationData.moveTiles.push(tile);
      }
    }

    this.animationDatas.push(animationData);
  }

  // 每帧调用
  DrawHelper.prototype.update = function () {
    if (this.animationDatas.length > 0) {
      this.updateMove();
      this.dirty = true;
    }

    if (this.dirty) {
      this.draw();
      this.dirty = false;
    }
    this.animationFrame(this.update);
  };

  // 动画运动更新
  DrawHelper.prototype.updateMove = function () {
    let currentTime = getTimeNow();
    // 需要结束的animationData
    let toCompleteAnimationDataIndex = [];
    if (this.animationDatas.length > 0) {
      for (var i = 0; i < this.animationDatas.length; i++) {
        let animationData = this.animationDatas[i];
        let lastTime = animationData.lastTime;
        let duration = animationData.duration;
        let startTime = animationData.startTime;

        if (lastTime > startTime + duration) {
          toCompleteAnimationDataIndex.push(i);
        } else {
          let tiles = animationData.moveTiles;
          if (tiles && tiles.length > 0) {
            for (var j = 0; j < tiles.length; j++) {
              let tile = tiles[j];
              let ratio = (currentTime - startTime) / duration
              let x = tile.startX + (tile.destX - tile.startX) * ratio;
              let y = tile.startY + (tile.destY - tile.startY) * ratio;
              tile.x = x;
              tile.y = y;
            }
          }
          animationData.lastTime = currentTime;
        }
      }
    }

    // 弹出complete的animationData，调用回调
    while (toCompleteAnimationDataIndex.length > 0) {
      let index = toCompleteAnimationDataIndex.pop();
      let animationData = this.animationDatas[index];
      let caller = animationData.caller;
      let cb = animationData.callback;
      cb && cb.call(caller, [1, 2, 3]);

      this.animationDatas.splice(index, 1);
    }
  }

  // 绘制
  DrawHelper.prototype.draw = function () {
    let ctx = this.ctx;
    this.initTextSetting();
    for (var i = 0; i < this.animationDatas.length; i++) {
      let animationData = this.animationDatas[i];

      let moveTiles = animationData.moveTiles;
      if (moveTiles && moveTiles.length > 0) {
        for (var i = 0; i < moveTiles.length; i++) {
          moveTiles[i].draw(ctx);
        }
      }

      let centerTile = animationData.centerTile;
      centerTile && centerTile.draw(ctx);
    }
    ctx.draw();
  };

  return DrawHelper;
}());

// tileData
var Tile = (function () {

  function Tile(x, y, color, text, destX, destY) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.color = color;
    this.text = text;
    this.destX = destX;
    this.destY = destY;
  }

  Tile.prototype.draw = function (ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.setFillStyle(this.color);
    this.fillRoundRect(ctx, TILE_SIZE, TILE_SIZE, ROUND_CAP_SIZE)
    // ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.translate(HALF_ITEM_SIZE - util.rpx2px(6), HALF_ITEM_SIZE - util.rpx2px(5));
    ctx.setFillStyle("white");
    let width = ctx.measureText(this.text).width;
    ctx.fillText(this.text);
    ctx.restore();
  }

  Tile.prototype.fillRoundRect = function (cxt, width, height, radius) {
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

  return Tile;
}());

module.exports = DrawHelper;
