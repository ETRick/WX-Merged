const CONSTS= require("../consts.js");


var POSITION_TRANSFER = {

  // 网格坐标转化为id
  gridPos2Id: function (x, y) {
    if (x >= CONSTS.MAP_SIZE)
      return false;
    if (x < 0)
      return false;
    if (y >= CONSTS.MAP_SIZE)
      return false;
    if (y < 0)
      return false;
    return x + y * CONSTS.MAP_SIZE;
  },

  // id 转换为 网格坐标
  id2GridPos: function (id) {
    let y = Math.floor(id / CONSTS.MAP_SIZE);
    let x = Math.floor(id % CONSTS.MAP_SIZE);
    return { x: x, y: y };
  },

  // 网格坐标转为canva的坐标
  gridPos2ViewPos: function (gridX, gridY) {
    let destX = CONSTS.GAME_AREA.left + (gridX + 0.5) * CONSTS.BOX_WIDTH;
    let destY = CONSTS.GAME_AREA.top + (gridY + 0.5) * CONSTS.BOX_WIDTH;
    return { x: destX, y: destY };
  }
}

module.exports = POSITION_TRANSFER;