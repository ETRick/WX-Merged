// components/retriveui/index.js
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
    reviveCount: null,
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

    pauseCountDown: function () {
      this.isPause = true;
    },

    resumeCountDown: function () {
      this.isPause = false;
    },

    /** 开始复活页面倒计时计数 */
    startReviveCount: function (failCb) {
      let that = this;

      let update = () => {
        if (that.isPause)
          return;
        that.data.reviveCount--;
        that.setData({
          reviveCount: that.data.reviveCount,
        });
        if (that.data.reviveCount <= 0) {
          that.stopReviveCount();
          if (failCb && typeof (failCb) == "function"){
            failCb();
          }
        }
      }
      this.interval = setInterval(update, 1000);
    },

    /** 提示分享复活 */
    showReviveGameTips: function (failCb) {
      this.show();
      this.setData({
        reviveCount: 10,
      });
      this.startReviveCount(failCb);
    },

    /** 停止复活页面倒计时计数 */
    stopReviveCount: function () {
      clearInterval(this.interval);
      this.interval = null;
      this.hide();
    },

    show: function () {
      this.isPause = false;
      this.dialog.show();
    },

    hide: function () {
      this.isPause = true;
      this.dialog.hide();
    },

    _gameOver: function(){
      this.stopReviveCount();
      this.triggerEvent("gameOver");
    }
  }
})