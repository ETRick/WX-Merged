// 游戏区域长宽的格子个数
const util = require('utils/util.js');
const rpx2px = util.rpx2px;
/* ------------------------------------------------------------------------ */

//游戏区域的边长
const GAME_AREA_WIDTH = rpx2px(600);

let marginLeft = (wx.getSystemInfoSync().windowWidth - GAME_AREA_WIDTH) / 2;
// 暂时是5x5的棋格
// 单位均为rpx
const GAME_AREA = {
  top: rpx2px(270),
  left: marginLeft,
  width: 565,
  height: 565
};
// 游戏区域长宽的格子个数
const MAP_SIZE = 5;
// 包含item的外壳的宽度
const BOX_WIDTH = GAME_AREA_WIDTH / MAP_SIZE;
// 一个带颜色格子的宽度
const ITEM_WIDTH = BOX_WIDTH - rpx2px(10);
// 一帧的时间
const FRAME_INTERVAL = 1000 / 60;
// 缺省的格子颜色
const DEFAULT_COLOR = "#35334F";
// 放置完后新的棋子生成等待的时间
const STEP_OVER_WATI_TIME = 200;
// 坐标默认用rpx
const OPTION_TOOL_X = rpx2px(375);
const OPTION_TOOL_Y = rpx2px(1003);
// 手指点击拖动方块时候方块在上方的偏移
const OFFESET_Y = rpx2px(110);
// 匹配之后移动过去的时间
const FIT_MOVE_TIME = 60;
// 合成的时间
const MERGE_TIME = 200;
// 旋转事件
const ROTATE_TIME = 150;

const CONSTS = {
  GAME_AREA: GAME_AREA,
  GAME_AREA_WIDTH: GAME_AREA_WIDTH,
  MAP_SIZE: MAP_SIZE,
  BOX_WIDTH: BOX_WIDTH,
  ITEM_WIDTH: ITEM_WIDTH,
  FRAME_INTERVAL: FRAME_INTERVAL,
  DEFAULT_COLOR: DEFAULT_COLOR,
  STEP_OVER_WATI_TIME: STEP_OVER_WATI_TIME,
  OPTION_TOOL_X: OPTION_TOOL_X,
  OPTION_TOOL_Y: OPTION_TOOL_Y,
  OFFESET_Y: OFFESET_Y,
  FIT_MOVE_TIME: FIT_MOVE_TIME,
  MERGE_TIME: MERGE_TIME,
  ROTATE_TIME: ROTATE_TIME
}

module.exports = CONSTS;
