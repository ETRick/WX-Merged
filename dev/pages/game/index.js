// pages/game/index.js


// 暂时是5x5的棋格
// 单位均为rpx
const GAME_AREA = {
  top: 200,
  left: 75,
  width: 565,
  height: 565
};

const MAX_WIDTH_RPX = 750;
const MAX_HEIGHT_RPX = 1334;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    rowCount: 5,
    colCount: 5,
    tileLength: 120,
    tilePosXList: null,   //index 为 id starting from 0, id = row * colCont + col;
    tilePosYListt: null,
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

  },

  initMap: function () {
    var tilePosXList = [];
    var tilePosYList = [];
    var startX = GAME_AREA.left;
    var startY = GAME_AREA.top;
    let tileLength = this.data.tileLength;
    let rowCount = this.data.rowCount;
    let colCount = this.data.colCount;

    for (var row = 0; row < this.data.rowCount; row++) {
      for (var col = 0; col < this.data.colCount; col++) {
        let id = this.xy2id(col, row);
        let y = startY + row * tileLength;
        let x = startX + (col%colCount) * tileLength;
        tilePosXList[id] = x;
        tilePosYList[id] = y;
       }
    }

    this.setData({
      tilePosXList: tilePosXList,
      tilePosYList: tilePosYList
    });
  },

  xy2id: function(x, y){
    return x + y * this.data.colCount;
  }
})