// pages/lobby/index.js

const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bestScore: 0,
    isMusicOn: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.bestScore = util.getLocalData("bestScore") || 0;
    // this.data.isMusicOn = 
    this.setData({
      bestScore: this.data.bestScore
    });
  },

  clickMusicToggle: function(){
    // TODO 音樂開啟關閉
  },

  startGame: function(){
    wx.navigateTo({
      url: "/pages/game/index"
    }) 
  },

  follow: function(){
    wx.showModal({
      title: '关注公众号',
      content: '待开放',
      showCancel: false
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})