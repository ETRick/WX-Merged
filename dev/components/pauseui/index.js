// components/retriveui/index.js
const app = getApp();
Component({
  // 倒计时是否暂停
  isPause: false,

  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    reviveCount: {
      type: Number,
      value: 0,
    },

    score: {
      type: Number,
      value: 0,
    },
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    isAudioOn: app.globalData.isAudioOn
  },

  attached: function () {
    this.dialog = this.selectComponent("#dialog");
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {

    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */

    show: function () {
      this.isPause = false;
      this.dialog.show();
    },

    hide: function () {
      this.isPause = true;
      this.dialog.hide();
    },

    _replay: function () {
      this.triggerEvent("replay");
    },

    _close: function () {
      this.triggerEvent("close");
    },

    _audioHandle: function () {
      // todo 单独抽离出来
      app.globalData.isAudioOn = !app.globalData.isAudioOn;
      this.setData({
        isAudioOn: app.globalData.isAudioOn
      });
    },

    _returnHome: function () {
      this.hide();
      wx.navigateBack({ delta: 1});
    }
  }
})