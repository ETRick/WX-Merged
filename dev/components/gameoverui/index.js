// components/gameoverui/index.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    score: {
      type: Number,
      value: 0,
    },

    bestScore:{
      type: Number,
      value: 0
    }
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    degree: 0
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
      this._setDegree();
      this.dialog.show();
    },

    hide: function () {
      this.dialog.hide();
    },

    _retry: function () {
      this.hide();
      this.triggerEvent("retry");
    },

    _returnHome: function () {
      wx.navigateBack({});
    },

    /** 计算全国排名百分比 */
    _setDegree() {
      let score = this.properties.score;
      if (score <= 0) {
        this.data.degree = 0;
      } else if (score <= 5) {
        this.data.degree = 30 + 5 * score / 5;
      } else if (score <= 8) {
        this.data.degree = 80 + 1.5 * (score - 5);
      } else if (score <= 12) {
        this.data.degree = 95 + 4 * (score - 8) / 9;
      } else if (score <= 18) {
        this.data.degree = 97 + 4 * (score - 12) / 9;
      } else {
        this.data.degree = 99;
      }
      this.data.degree += Math.random();
      this.data.degree = parseInt(this.data.degree * 100) / 100;
      this.setData({
        degree: this.data.degree,
      });
    },
  }
})