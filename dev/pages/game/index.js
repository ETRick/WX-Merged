// pages/game/index.js

const util = require('../../utils/util.js');
const Shapes = require('../../shape/shapes.js');
const ComposedAnimation = require('../../utils/composedAnimation.js');
const animationController = ComposedAnimation.animationController;
const MergeAnimation = ComposedAnimation.MergeAnimation;
const COLORS = require("../../utils/colors.js");
const getTileImgSrcByValue = COLORS.getTileImgSrcByValue;
const getColorByValue = COLORS.getColorByValue;
const VALUE_COLORS = COLORS.VALUE_COLORS;

const SingleShape = Shapes.Single;
const PairShape = Shapes.Pair;
const rpx2px = util.rpx2px;

//游戏区域的边长
const GAME_AREA_WIDTH = rpx2px(600);
// 游戏区域长宽的格子个数
const COLUMNS = 5;
// 包含item的外壳的宽度
const BOX_WIDTH = GAME_AREA_WIDTH / COLUMNS;
// 一个带颜色格子的宽度
const ITEM_WIDTH = BOX_WIDTH - rpx2px(10);
// 一帧的时间
var frameInterval = 1000 / 60;
// 缺省的格子颜色
const DEFAULT_COLOR = "#35334F";
// 放置完后新的棋子生成等待的时间
const STEP_OVER_WATI_TIME = 200;
// 坐标默认用rpx
const OPTION_TOOL_X = rpx2px(375);
const OPTION_TOOL_Y = rpx2px(1003);
// 手指点击拖动方块时候方块在上方的偏移
const OFFESET_Y = rpx2px(110);
// 匹配之后移动过去的时间
const FIT_MOVE_TIME = 60;
// 合成的时间
const MERGE_TIME = 200;
// 游戏格子区域的起始位置
// 当前合成到的最大的数组
var currentMaxNumber = 2;

var animationFrame = function (callback, caller) {
  setTimeout(function () {
    callback.call(caller);
  }, frameInterval);
}

let marginLeft = (wx.getSystemInfoSync().windowWidth - GAME_AREA_WIDTH)/2;

// 暂时是5x5的棋格
// 单位均为rpx
const GAME_AREA = {
  top: rpx2px(270),
  left: marginLeft,
  width: 565,
  height: 565
};

const GAME_AREA_START_POS = { x: GAME_AREA.left, y: GAME_AREA.top };

const MAX_WIDTH_RPX = 750;
const MAX_HEIGHT_RPX = 1334;

Page({
  ctx: null,
  shape: null,
  inTouch: false,
  lastPos: null,

  /**
   * 页面的初始数据
   */
  data: {
    debugLog: "debugLog",
    score: 0,
    rowCount: 5,
    colCount: 5,
    tileLength: GAME_AREA_WIDTH / COLUMNS * 2,
    tilePosXList: null,   //index 为 id starting from 0, id = row * colCont + col;
    tilePosYListt: null,
    tileColor: [],
    tileValue: [],
    tileOccpuied: [],
    tileImgSrc:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initMap();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.ctx = wx.createCanvasContext("game-canvas", this);
    this.initFontSetting();
    animationFrame(this.update, this);
    this.generateOption();
  },

  initFontSetting: function () {
    let fontSize = util.rpx2px(70);
    this.ctx.setFontSize(fontSize);
    this.ctx.setTextAlign("center");
    this.ctx.setTextBaseline("middle");
    // this.ctx.font = `${fontSize}px Arial`;
  },

  update: function () {
    this.logicUpdate();
    this.render();
    animationFrame(this.update, this);
  },

  // 逻辑刷新
  logicUpdate: function () {
    if (this.shape) {
      this.shape.update();
    }

    animationController.update();
  },

  // 渲染刷新
  render: function () {
    this.initFontSetting();
    if (this.shape) {
      this.shape.draw(this.ctx);
    }
    animationController.draw(this.ctx);
    this.ctx.draw();
  },

  // 初始盘面
  initMap: function () {
    var tilePosXList = [];
    var tilePosYList = [];
    var tileColor = [];
    var tileValue = [];
    var tileImgSrc = [];
    let tileOccpuied = [];
    var startX = GAME_AREA.left;
    var startY = GAME_AREA.top;

    let rowCount = this.data.rowCount;
    let colCount = this.data.colCount;

    for (var row = 0; row < this.data.rowCount; row++) {
      for (var col = 0; col < this.data.colCount; col++) {
        let id = this.gridPos2Id(col, row);
        let y = startY + row * BOX_WIDTH;
        let x = startX + (col % colCount) * BOX_WIDTH;
        tilePosXList[id] = x;
        tilePosYList[id] = y;
        tileColor[id] = DEFAULT_COLOR;
        tileValue[id] = "";
        tileOccpuied[id] = false;
        tileImgSrc[id] = "";
      }
    }

    this.setData({
      tilePosXList: tilePosXList,
      tilePosYList: tilePosYList,
      tileColor: tileColor,
      tileValue: tileValue,
      tileOccpuied: tileOccpuied,
      tileImgSrc: tileImgSrc
    });
  },

  // 生成一個填充物
  generateOption: function () {
    if (this.isNextSingle()) {
      let value = Math.floor(Math.random() * currentMaxNumber + 1);
      this.shape = new SingleShape(OPTION_TOOL_X, OPTION_TOOL_Y, ITEM_WIDTH, ITEM_WIDTH, value);
    } else {
      var value1, value2;
      value1 = Math.floor(Math.random() * currentMaxNumber + 1);
      while (!value2 || value2 == value1) {
        value2 = Math.floor(Math.random() * currentMaxNumber + 1);
      }
      this.shape = new PairShape(OPTION_TOOL_X, OPTION_TOOL_Y, ITEM_WIDTH, ITEM_WIDTH, BOX_WIDTH, value1, value2);
    }
    this.shape.growUp();
  },

  // 接下去产生的是不是单个的
  isNextSingle: function () {
    if (this.hasContiousPos()){
      return Math.random() > 0.5;
    }else{
      return true;
    }
  },

  // 是否存在连续
  hasContiousPos: function () {
    var that = this;
    var check = function (id) {
      if (id < COLUMNS * COLUMNS) {
        return !that.data.tileOccpuied[id]
      }
    }

    for (var id = 0; id < COLUMNS * COLUMNS; id++) {
      if (check(id)) {
        let rightId = id + 1;
        if (check(rightId))
          return true;
        let downId = id + COLUMNS;
        if (check(downId))
          return true;
      }
    }
    return false;
  },

  // 是否点中待填充物
  isInOptionArea: function (x, y) {
    if (this.shape) {
      let test = this.shape.inBound(x, y);
      return this.shape.inBound(x, y);
    }
    return false;
  },

  // 一个步骤结束
  oneStepOver: function () {
    console.log("oneStepOver");
    var that = this;
    let allSingleShapeViewPosList = this.shape.getAllSingleOneRelativePoses();

    let values = this.shape.values;

    for (var i = 0; i < allSingleShapeViewPosList.length; i++) {
      let relativePos = allSingleShapeViewPosList[i];
      let x = relativePos.x + this.shape.x;
      let y = relativePos.y + this.shape.y;
      let gridPos = this.viewPos2GridPos(x, y);
      this.addTile(gridPos.x, gridPos.y, values[i] || this.shape.value);
    }

    setTimeout(() => {
      that.shape = null;
    }, frameInterval * 2);
    setTimeout(() => {
      that.generateOption();
    }, STEP_OVER_WATI_TIME);
  },

  // 向地图添加一个css绘制的tile
  addTile: function (gridX, gridY, value) {
    console.log("add to ", gridX, gridY);
    // 更新当前合成的最大值
    if (value > currentMaxNumber) {
      currentMaxNumber = value;
    }

    let id = this.gridPos2Id(gridX, gridY);
    this.data.tileColor[id] = getColorByValue(value);
    this.data.tileValue[id] = value;
    this.data.tileImgSrc[id] = getTileImgSrcByValue(value);
    this.data.tileOccpuied[id] = true;
    this.setData({
      tileColor: this.data.tileColor,
      tileValue: this.data.tileValue,
      tileOccpuied: this.data.tileOccpuied,
      tileImgSrc: this.data.tileImgSrc
    });

    var that = this;
    setTimeout(()=>{
      that.mergeOne(gridX, gridY);
    }, 200);
  },

  // 检查是否能形成消除
  /** 以某一个tile为中心合并相邻3个及以上相同的tile */
  mergeOne: function (posX, posY) {
    let scanedTiles = [];
    let findTiles = [];
    let directions = [
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];

    var that = this;

    let nowId = this.gridPos2Id(posX, posY);
    let targetValue = this.data.tileValue[nowId];

    let merge = (x, y) => {
      let id = that.gridPos2Id(x, y);
      if (scanedTiles.indexOf(id) == -1) {
        scanedTiles.push(id);
        if (that.data.tileValue[id] && that.data.tileValue[id] === targetValue) {
          findTiles.push(id);
        } else {
          return;
        }
      } else {
        return;
      }

      for (var i = 0; i < directions.length; i++) {
        let nextX = x + directions[i].x;
        let nextY = y + directions[i].y;
        merge(nextX, nextY);
      }
    };

    merge(posX, posY);

    let index = findTiles.indexOf(nowId);
    findTiles.splice(index, 1);

    if (findTiles.length >= 2) {
      this.mergeTiles(findTiles, nowId);
    }
  },

  // 播放merge效果
  mergeTiles: function (findTileIds, centerId) {
    let that = this;
    let currentValue = this.data.tileValue[centerId]
    this.data.tileValue[centerId] = "";
    this.data.tileOccpuied[centerId] = false;
    this.data.tileColor[centerId] = DEFAULT_COLOR;
    for (var i = 0; i < findTileIds.length; i++) {
      let index = findTileIds[i];
      this.data.tileValue[index] = "";
      this.data.tileOccpuied[index] = false;
      this.data.tileColor[index] = DEFAULT_COLOR;
      // this.setData({
      //   tileValue: this.data.tileValue,
      //   tileColor: this.data.tileColor,
      //   tileOccpuied: this.data.tileOccpuied,
      // });
    }

    setTimeout(() => {
      that.setData({
        tileValue: that.data.tileValue,
        tileColor: that.data.tileColor,
        tileOccpuied: that.data.tileOccpuied,
      });
    }, frameInterval * 2);

    let centerGridPos = this.id2GridPos(centerId);
    let viewPos = this.gridPos2ViewPos(centerGridPos.x, centerGridPos.y);
    let centerTile = new SingleShape(viewPos.x, viewPos.y, ITEM_WIDTH, ITEM_WIDTH, currentValue);

    var moveTiles = [];
    for (var i = 0; i < findTileIds.length; i++) {
      let gridPos = this.id2GridPos(findTileIds[i]);
      let viewPos = this.gridPos2ViewPos(gridPos.x, gridPos.y);
      let tile = new SingleShape(viewPos.x, viewPos.y, ITEM_WIDTH, ITEM_WIDTH, currentValue);
      moveTiles.push(tile);
    }

    var mergeAnimation = new MergeAnimation(centerTile, moveTiles, MERGE_TIME, () => {
      that.addTile(centerGridPos.x, centerGridPos.y, currentValue + 1);
      that.data.score += currentValue * (findTileIds.length + 1);
      that.setData({
        score: that.data.score
      });
    })

    animationController.startMergeAnimation(mergeAnimation);
  },

  // 获取可以填充位置与当前位置的距离，二位{x,y}
  getFitRelativeDist: function (pos) {
    var targetRelativeDist; //二维，x， y

    let detectViewPos = {
      x: pos.x - GAME_AREA_START_POS.x,
      y: pos.y - OFFESET_Y - GAME_AREA_START_POS.y
    }

    let allSingleShapeViewPosList = this.shape.getAllSingleOneRelativePoses();

    for (var i = 0; i < allSingleShapeViewPosList.length; i++) {
      let relativePos = allSingleShapeViewPosList[i];
      let x = relativePos.x + detectViewPos.x;
      let y = relativePos.y + detectViewPos.y;
      let gridX = Math.floor(x / BOX_WIDTH);
      let gridY = Math.floor(y / BOX_WIDTH);
      if (gridX < COLUMNS && gridX > -1 && gridY < COLUMNS && gridY > -1) {
        let id = this.gridPos2Id(gridX, gridY);
        if (!this.data.tileOccpuied[id]) {
          if (!targetRelativeDist) {
            let targetViewPos = this.gridPos2ViewPos(gridX, gridY);
            targetRelativeDist = {
              x: targetViewPos.x - x - GAME_AREA_START_POS.x,
              y: targetViewPos.y - y - GAME_AREA_START_POS.y
            }
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    return targetRelativeDist;
  },

  // -------------功能性的--------
  // 网格坐标转化为id
  gridPos2Id: function (x, y) {
    if (x >= COLUMNS)
      return false;
    if (x < 0)
      return false;
    if (y >= COLUMNS)
      return false;
    if (y < 0)
      return false;
    return x + y * this.data.colCount;
  },

  // id 转换为 网格坐标
  id2GridPos: function (id) {
    let y = Math.floor(id / COLUMNS);
    let x = Math.floor(id % COLUMNS);
    return { x: x, y: y };
  },

  // 网格坐标转为canva的坐标
  gridPos2ViewPos: function (gridX, gridY) {
    let destX = GAME_AREA_START_POS.x + (gridX + 0.5) * BOX_WIDTH;
    let destY = GAME_AREA_START_POS.y + (gridY + 0.5) * BOX_WIDTH;
    return { x: destX, y: destY };
  },

  // 视图坐标转化为网格坐标
  viewPos2GridPos: function (x, y) {
    let gridX = Math.floor((x - GAME_AREA_START_POS.x - 0.5 * BOX_WIDTH) / BOX_WIDTH);
    let gridY = Math.floor((y - GAME_AREA_START_POS.y - 0.5 * BOX_WIDTH) / BOX_WIDTH);
    return { x: gridX, y: gridY };
  },

  // 打log
  log: function (str) {
    this.setData({
      debugLog: str || ""
    });
  },

  // -------------------------------事件--------------------------
  resetOption:function(e){
    console.log("rest");
    this.generateOption();
  },

  clickPause: function(e){
    wx.showToast({
      title: 'TODO 暂停',
    })
    console.log("Pause");
  },

  touchStart: function (e) {
    if (this.isInOptionArea(e.touches[0].x, e.touches[0].y)) {
      this.inTouch = true;
      this.lastPos = e.touches[0];

      setTimeout(() => {
        if (!this.inTouch) {
          this.shape.rotate(90, 300);
        }
      }, 100);
    }
  },

  // 绘制中 手指在屏幕上移动
  touchMove: function (e) {
    if (!this.inTouch)
      return;
    let pos = e.touches[0];
    let x = pos.x;
    let y = pos.y - OFFESET_Y;
    this.shape.setPos(x, y);
    this.lastPos = pos;
  },

  // 绘制结束 手指抬起
  touchEnd: function () {
    let that = this;
    if (this.inTouch) {
      let fitRelativeDist = this.getFitRelativeDist(this.lastPos);
      if (fitRelativeDist) {
        console.log(fitRelativeDist);
        this.shape.move(fitRelativeDist.x, fitRelativeDist.y, FIT_MOVE_TIME, () => {
          // TODO 在该位置产生一个
          that.oneStepOver();
        })
        // that.oneStepOver();
      } else {
        this.shape.moveTo(OPTION_TOOL_X, OPTION_TOOL_Y, 200);
      }
    }
    this.inTouch = false;
  }
})