//index.js
//获取应用实例
const app = getApp()

var Bmob = require('../../utils/bmob.js');

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

  },
  getUserInfo: function(e) {
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });

    this.updateUserSettingInfo(e.detail.userInfo);
    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    // 所以此处加入 callback 以防止这种情况
    if (this.userInfoReadyCallback) {
      this.userInfoReadyCallback(app.globalData.userInfo)
    }
  },

  /** 更新用户设置数据 */
  updateUserSettingInfo(userInfo) {
    console.log(userInfo);
    app.globalData.userInfo.nickName = userInfo.nickName;
    app.globalData.userInfo.avatarUrl = userInfo.avatarUrl;

    console.log("updateUserSettingInfo id ====>" + app.globalData.userInfo.id)
    if (app.globalData.userInfo.id == null) {
      return;
    }

    let User = Bmob.Object.extend("_User");
    let query = new Bmob.Query(User);
    console.log(app.globalData.userInfo.id);
    query.get(app.globalData.userInfo.id, {
      success: function (result) {
        result.set('nickName', userInfo.nickName);
        result.set('avatarUrl', userInfo.avatarUrl);
        result.save();
      }
    });

    setTimeout(()=>{
      app.sendBestScore(12);
    }, 1000);
  },
})
