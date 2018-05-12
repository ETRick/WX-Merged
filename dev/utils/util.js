const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const windowWidth = wx.getSystemInfoSync().windowWidth;

var rpx2px = (rpx) => {
  return windowWidth / 750.0 * rpx;
}

var jsonLength = (obj) => {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
}

var getTimeNow = function () {
  return +new Date();
};

var setLocalData = function(key,data){
  wx.setStorageSync(key, data);
};

var getLocalData = function(key){
  return wx.getStorageSync(key);
};

var distance = function(posA, posB){
  let a = Math.pow(posA.x -posB.x, 2);
  let b =Math.pow(posA.y - posB.y, 2);
  return Math.pow(a + b, 0.5);
}

module.exports = { formatTime, rpx2px, jsonLength, getTimeNow, setLocalData, getLocalData, distance }
