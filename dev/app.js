//app.js

var Bmob = require('utils/bmob.js');
Bmob.initialize("f1a51d2abd41b02751d1f63de420123d", "26bbbf266862cc78d3962d5220883f8b");

App({
  onLaunch: function () {
    var that = this;
    // 登录
    wx.login({
      success: res => {
        Bmob.User.requestOpenId(res.code, {
          success: function (userData) {
            let openId = userData.openid;
            // 使用openid登陆,并获得userId
            Bmob.User.logIn(openId, "password", {
              success: function (user) {
                that.loginComplete(user);
              },
              error: function (user, error) {
                if (error.code == '101') {
                  let user = new Bmob.User();//开始注册用户
                  user.set('username', openId);
                  user.set('password', "password");
                  user.signUp(null, {
                    success: function (result) {
                      that.loginComplete(user);
                    }
                  });
                }
              }
            });
          }
        });
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },

  /** 登陆完成 */
  loginComplete: function (user) {
    console.log(user);
    console.log("loginComplete=======> " + user.id);
    this.globalData.userInfo.id = user.id;
    this.globalData.userInfo.bestScore = typeof (user.get("bestScore")) == "undefined" ? 0 : user.get("bestScore");
  },

  sendBestScore: function(bestScore){
    let User = Bmob.Object.extend("_User");
    let query = new Bmob.Query(User);
    console.log(this.globalData.userInfo.id);
    query.get(this.globalData.userInfo.id, {
      success: function (result) {
        console.log(result);
        if ((result.get("bestScore") || 0) < bestScore) {
          result.set('bestScore', bestScore);
          result.save();
        }
      },
      error: function (result, error) {
        console.log("查询失败");
        console.log(result);
        console.log(error);
      }
    });
  },

  // 获取最高分
  getBestScore: function (cb) {
    if (this.globalData.userInfo.id == null) {
      return;
    }
    let User = Bmob.Object.extend("_User");
    let query = new Bmob.Query(User);
    query.get(this.globalData.userInfo.id, {
      success: function (result) {
        if (typeof (cb) == "function") {
          cb(result.get("bestScore") || 0);
        }
      }
    });
  },

  /** 设置相互好友 */
  setEachFrid: function (userId, otherUserId) {
    if (userId == 0 || otherUserId == 0) {
      return;
    }
    if (userId == null || otherUserId == null) {
      return;
    }

    let setFrid = function (uId, fId) {
      var Friends = Bmob.Object.extend("Friends");
      var query = new Bmob.Query(Friends);
      query.equalTo("own", uId);
      query.first({
        success: function (result) {
          if (result == undefined) {
            var friends = new Friends();
            friends.set("own", uId);
            friends.set("frids", [fId]);
            //添加数据，第一个入口参数是null
            friends.save(null, {
              success: function (result) {
              }
            });
          } else {
            let frids = result.get("frids") || [];
            if (util.arrayContain(frids, fId) == false) {
              frids.push(fId);
              result.set('frids', frids);
              result.save();
            }
          }
        }
      });
    };
    setFrid(userId, otherUserId);
    setFrid(otherUserId, userId);
  },

  /** 获取好友数据 */
  getFrids: function (cb) {
    let currentUser = Bmob.User.current();
    let getFridIds = function (cb) {
      var Friends = Bmob.Object.extend("Friends");
      var query = new Bmob.Query(Friends);
      query.equalTo("own", currentUser.id);
      query.first({
        success: function (result) {
          if (result == undefined) {
            if (typeof (cb) == "function") { cb([]); }
            return;
          }
          let frids = result.get("frids") || [];
          if (typeof (cb) == "function") { cb(frids); }
        }, error: function (error) {
          if (typeof (cb) == "function") { cb([]); }
        }
      });
    }

    getFridIds((frids) => {
      if (frids.length <= 0) {
        if (typeof (cb) == "function") { cb([]); }
        return;
      }

      let User = Bmob.Object.extend("_User");
      let query = new Bmob.Query(User);
      query.containedIn("objectId", frids);
      query.descending("bestScore");
      query.limit(10);
      query.find({
        success: function (results) {
          console.log("共查询到 " + results.length + " 条记录");
          // 循环处理查询到的数据
          let frids = [];
          for (var i = 0; i < results.length; i++) {
            let object = results[i];
            let user = {};
            user.id = object.id;
            user.nickName = object.get('nickName');
            user.avatarUrl = object.get('avatarUrl');
            user.bestScore = object.get('bestScore') == undefined ? 0 : object.get('bestScore');
            frids.push(user);
          }
          console.log(frids);
          if (typeof (cb) == "function") { cb(frids); }
        },
        error: function (error) {
          if (typeof (cb) == "function") { cb([]); }
        }
      });
    });
  },

  globalData: {
    isAudioOn: true,
    userInfo: {}
  }
})