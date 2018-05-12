// pages/game/index.js

const util = require('../../utils/util.js');
const mathHelper = require("../../utils/mathHelper.js")
const Shapes = require('../../shape/shapes.js');
const animations = require('../../animation/animations.js');
const COLORS = require("../../utils/colors.js");
const POS_TRANS = require("../../utils/positionTransfer.js");

const animationController = animations.AnimationController;

const MergeAnimation = animations.MergeAnimation;
const ExploreAnimation = animations.ExploreAnimation;

const getTileImgSrcByValue = COLORS.getTileImgSrcByValue;
const getColorByValue = COLORS.getColorByValue;
const VALUE_COLORS = COLORS.VALUE_COLORS;

const SingleTile = Shapes.SingleTile;
const PairShape = Shapes.PairTile;
const rpx2px = util.rpx2px;

var {
  GAME_AREA,
  GAME_AREA_WIDTH,
  MAP_SIZE,
  BOX_WIDTH,
  ITEM_WIDTH,
  FRAME_INTERVAL,
  DEFAULT_COLOR,
  STEP_OVER_WATI_TIME,
  OPTION_TOOL_X,
  OPTION_TOOL_Y,
  OFFESET_Y,
  FIT_MOVE_TIME,
  ROTATE_TIME,
  MERGE_TIME
} = require("../../consts.js");

console.log(BOX_WIDTH);

const DIRECTIONS = [
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
];

var animationFrame = function (callback, caller) {
  setTimeout(function () {
    callback.call(caller);
  }, FRAME_INTERVAL);
}

Page({
  ctx: null,
  shape: null,
  inTouch: false,
  lastPos: null,
  // 游戏格子区域的起始位置,默认为2
  // 当前合成到的最大的数组
  currentMaxNumber: 2,

  /**
   * 页面的初始数据
   */
  data: {
    score: 0,
    tilePosXList: null,   //index 为 id starting from 0, id = row * colCont + col;
    tilePosYListt: null,
    tileColor: [],
    tileValue: [],
    tileOccpuied: [],
    tileImgSrc: [],
    hideCanvas: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.startNewGame();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  // 字体设置
  initFontSetting: function () {
    let fontSize = util.rpx2px(70);
    this.ctx.setFontSize(fontSize);
    this.ctx.setTextAlign("center");
    this.ctx.setTextBaseline("middle");
  },

  // 更新逻辑
  update: function () {
    this.logicUpdate();
    this.render();
    animationFrame(this.update, this);
  },

  // 逻辑刷新
  logicUpdate: function () {
    this.shape && this.shape.update();
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

    for (var row = 0; row < MAP_SIZE; row++) {
      for (var col = 0; col < MAP_SIZE; col++) {
        let id = POS_TRANS.gridPos2Id(col, row);
        let y = startY + row * BOX_WIDTH;
        let x = startX + (col % MAP_SIZE) * BOX_WIDTH;
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

  startNewGame: function(){
    console.log("startNewGame");
    this.shape= null,
    this.inTouch=false,
    this.lastPos= null,
    this.currentMaxNumber=2;

    this.setData({
        score: 0,
        tilePosXList: null,
        tilePosYListt: null,
        tileColor: [],
        tileValue: [],
        tileOccpuied: [],
        tileImgSrc: [],
        hideCanvas: false,
    });

    this.initMap();

    this.ctx = wx.createCanvasContext("game-canvas", this);
    this.initFontSetting();
    animationFrame(this.update, this);
    this.generateOption();
  },

  // 生成一個填充物
  generateOption: function () {
    if (this.isNextSingle()) {
      let value = Math.floor(Math.random() * this.currentMaxNumber + 1);
      this.shape = new SingleTile(OPTION_TOOL_X, OPTION_TOOL_Y, value);
    } else {
      var value1, value2;
      value1 = Math.floor(Math.random() * this.currentMaxNumber + 1);
      while (!value2 || value2 == value1) {
        value2 = Math.floor(Math.random() * this.currentMaxNumber + 1);
      }
      this.shape = new PairShape(OPTION_TOOL_X, OPTION_TOOL_Y, value1, value2);
    }
    this.shape.growUp();
  },

  // 接下去产生的是不是单个的
  isNextSingle: function () {
    if (this.hasContiousPos()) {
      return Math.random() > 0.5;
    } else {
      return true;
    }
  },

  // 是否存在连续空位
  hasContiousPos: function () {
    var that = this;
    var check = function (id) {
      if (id < MAP_SIZE * MAP_SIZE) {
        return !that.data.tileOccpuied[id]
      }
    }

    for (var id = 0; id < MAP_SIZE * MAP_SIZE; id++) {
      if (check(id)) {
        let rightId = id + 1;
        if (check(rightId))
          return true;
        let downId = id + MAP_SIZE;
        if (check(downId))
          return true;
      }
    }
    return false;
  },


  // 一个步骤结束
  oneStepOver: function (targetGridPosList) {
    var that = this;
    let allSingleShapeViewPosList = this.shape.getAllSingleOneRelativePoses();

    let values = this.shape.values;

    for (var i = 0; i < allSingleShapeViewPosList.length; i++) {
      let gridX = targetGridPosList[i].x;
      let gridY = targetGridPosList[i].y;
      let gridPos = { x: gridX, y: gridY };
      this.addTile(gridPos.x, gridPos.y, values[i] || this.shape.value);
    }
    
    if (this.isGameOver()){
      wx.showToast({
        title: '游戏失败,手动重开'
      });
    }
    

    setTimeout(() => {
      that.shape = null;
    }, FRAME_INTERVAL * 2);
    setTimeout(() => {
      that.generateOption();
    }, STEP_OVER_WATI_TIME);
  },

  isGameOver: function(){
    for (var id = 0; id < MAP_SIZE * MAP_SIZE; id++) {
      if(!this.data.tileOccpuied[id])
      return false;
    }
    return true;
  },

  // 向地图添加一个css绘制的tile
  addTile: function (gridX, gridY, value) {
    // 更新当前合成的最大值
    if (value > this.currentMaxNumber) {
      this.currentMaxNumber = value;
    }

    let id = POS_TRANS.gridPos2Id(gridX, gridY);
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
    setTimeout(() => {
      that.mergeOne(gridX, gridY);
    }, 200);
  },

  // 检查是否能形成消除
  /** 以某一个tile为中心合并相邻3个及以上相同的tile */
  mergeOne: function (posX, posY) {
    let scanedTiles = [];
    let findTiles = [];

    var that = this;

    let nowId = POS_TRANS.gridPos2Id(posX, posY);
    let targetValue = this.data.tileValue[nowId];

    let merge = (x, y) => {
      let id = POS_TRANS.gridPos2Id(x, y);
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

      for (var i = 0; i < DIRECTIONS.length; i++) {
        let nextX = x + DIRECTIONS[i].x;
        let nextY = y + DIRECTIONS[i].y;
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
      this.removeTileById(index);
    }

    setTimeout(() => {
      that.setData({
        tileValue: that.data.tileValue,
        tileColor: that.data.tileColor,
        tileOccpuied: that.data.tileOccpuied,
      });
    }, FRAME_INTERVAL * 2);

    let centerGridPos = POS_TRANS.id2GridPos(centerId);
    let viewPos = POS_TRANS.gridPos2ViewPos(centerGridPos.x, centerGridPos.y);
    let centerTile = new SingleTile(viewPos.x, viewPos.y, currentValue);

    var moveTiles = [];
    for (var i = 0; i < findTileIds.length; i++) {
      let gridPos = POS_TRANS.id2GridPos(findTileIds[i]);
      let viewPos = POS_TRANS.gridPos2ViewPos(gridPos.x, gridPos.y);
      let tile = new SingleTile(viewPos.x, viewPos.y, currentValue);
      moveTiles.push(tile);
    }

    var mergeAnimation = new MergeAnimation(centerTile, moveTiles, MERGE_TIME, () => {
      that.onMergeComplete(centerGridPos, currentValue, findTileIds);
    })

    animationController.startAnimation(mergeAnimation);
  },

  removeTileById: function (id) {
    this.data.tileValue[id] = "";
    this.data.tileOccpuied[id] = false;
    this.data.tileColor[id] = DEFAULT_COLOR;
  },

  // merge结束后
  onMergeComplete: function (centerGridPos, currentValue, findTileIds) {
    if (currentValue == 7) {
      // 播放爆炸动画
      let exploreCenterViewPos = POS_TRANS.gridPos2ViewPos(centerGridPos.x, centerGridPos.y);
      var exploreAnimation = new ExploreAnimation(exploreCenterViewPos.x, exploreCenterViewPos.y, 800, null);
      animationController.startAnimation(exploreAnimation);

      //3X3的格子消除掉
      for (var col = centerGridPos.x - 1; col <= centerGridPos.x + 1; col++) {
        for (var row = centerGridPos.y - 1; row <= centerGridPos.y + 1; row++) {
          let id = POS_TRANS.gridPos2Id(col, row);
          if (id === false)
            continue;
          // 获取id然后把值加上去
          let value = this.data.tileValue[id];
          if (typeof (value) == "number") {
            this.data.score += value;
            this.removeTileById(id);
          }
        }
      }
    } else {
      this.addTile(centerGridPos.x, centerGridPos.y, currentValue + 1);

    }
    this.data.score += currentValue * (findTileIds.length + 1);
    this.setData({
      tileValue: this.data.tileValue,
      tileOccpuied: this.data.tileOccpuied,
      tileColor: this.data.tileColor,
      score: this.data.score
    });
  },

  // 获取可以填充位置与当前位置的距离，二位{x,y}
  getFitRelativeDist: function (pos, isDebug) {

    var debugLog = function(logItem){
      if(isDebug){
        console.log(logItem);
      }
    }
    var result;
    var targetRelativeDist; //二维，x， y
    var targetGridPosList;
    let detectViewPos = {
      x: pos.x - GAME_AREA.left,
      y: pos.y - OFFESET_Y - GAME_AREA.top
    }

    debugLog(detectViewPos);

    let allSingleShapeViewPosList = this.shape.getAllSingleOneRelativePoses();
    debugLog(allSingleShapeViewPosList);

    for (var i = 0; i < allSingleShapeViewPosList.length; i++) {
      let relativePos = allSingleShapeViewPosList[i];
      let x = relativePos.x + detectViewPos.x;
      let y = relativePos.y + detectViewPos.y;
      let gridX = Math.floor(x / BOX_WIDTH);
      let gridY = Math.floor(y / BOX_WIDTH);
      if (gridX < MAP_SIZE && gridX > -1 && gridY < MAP_SIZE && gridY > -1) {
        let id = POS_TRANS.gridPos2Id(gridX, gridY);
        if (!this.data.tileOccpuied[id]) {
          if (!targetRelativeDist) {
            let targetViewPos = POS_TRANS.gridPos2ViewPos(gridX, gridY);
            console.log({
              gridx: gridX,
              gridy: gridY,
              id: id
            })
            debugLog(targetViewPos);
            targetGridPosList = [];
            targetRelativeDist = {
              x: targetViewPos.x - x - GAME_AREA.left,
              y: targetViewPos.y - y - GAME_AREA.top,
            }
          }
          targetGridPosList.push({ x: gridX, y: gridY });
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    if (targetRelativeDist) {
      result = {
        targetRelativeDist: targetRelativeDist,
        targetGridPosList: targetGridPosList
      }
    }

    return result;
  },

  // -------------------------------事件--------------------------
  resetOption: function (e) {
    console.log("rest");
    this.generateOption();
  },

  clickPause: function (e) {
    // this.setData({
    //   hideCanvas: true
    // });

    this.startNewGame();
  },

  touchStart: function (e) {
    if (this.shape.inBound(e.touches[0].x, e.touches[0].y)) {
      this.inTouch = true;
      this.lastPos = e.touches[0];

      setTimeout(() => {
        if (!this.inTouch) {
          this.shape.rotate(90, ROTATE_TIME);
        }
      }, 200);
    }
  },

  // 绘制中 手指在屏幕上移动
  touchMove: function (e) {
    if (!this.inTouch)
      return;
    let pos = e.touches[0];
    if (mathHelper.distance(pos, this.lastPos) < 2){
      return ;
    }
    let x = pos.x;
    let y = pos.y - OFFESET_Y;

    let conficient = 0.8
    let x1 = mathHelper.lerp(this.shape.x, x, conficient);
    let y1 = mathHelper.lerp(this.shape.y, y, conficient);
    this.shape.setPos(x, y);
    this.lastPos = pos;

  },

  // 绘制结束 手指抬起
  touchEnd: function () {
    let that = this;
    if (this.inTouch) {
      let { targetRelativeDist, targetGridPosList } = this.getFitRelativeDist(this.lastPos);
      if (targetRelativeDist) {
        console.log("---------------------------------------------");
        console.log(targetRelativeDist);
        console.log(targetGridPosList);
        if (Math.abs(targetRelativeDist.x) > 200 || Math.abs(targetRelativeDist.y) > 200) {
          console.log("纯debug");
          this.getFitRelativeDist(this.lastPos, true);
        }

        this.shape.move(targetRelativeDist.x, targetRelativeDist.y, FIT_MOVE_TIME, () => {
          // TODO 在该位置产生一个
          that.oneStepOver(targetGridPosList);
        })
      } else {
        this.shape.moveTo(OPTION_TOOL_X, OPTION_TOOL_Y, 200);
      }
    }
    this.inTouch = false;
  }
})