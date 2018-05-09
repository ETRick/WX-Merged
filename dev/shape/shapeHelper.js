// 绘制圆角矩形
var fillRoundRect = function (cxt, width, height, radius) {
  //圆的直径必然要小于矩形的宽高          
  if (2 * radius > width || 2 * radius > height) { return false; }

  // 绘制圆角矩形的各个边 path
  cxt.beginPath(0);
  //从右下角顺时针绘制，弧度从0到1/2PI  
  cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
  //矩形下边线  
  cxt.lineTo(radius, height);
  //左下角圆弧，弧度从1/2PI到PI  
  cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
  //矩形左边线  
  cxt.lineTo(0, radius);
  //左上角圆弧，弧度从PI到3/2PI  
  cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2);
  //上边线  
  cxt.lineTo(width - radius, 0);
  //右上角圆弧  
  cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2);
  //右边线  
  cxt.lineTo(width, height - radius);
  cxt.closePath();

  cxt.fill();
}

module.exports = {
  fillRoundRect: fillRoundRect
}