const VALUE_COLORS = {
  0: "#99CC66",
  1: "#CCFF99",
  2: "#99CCFF",
  3: "#FF99FF",
  4: "#FFCC99",
  5: "#CCFF66",
  6: "#CCFF66",
  7: "#CCFF66"
}

const VALUE_IMG_SRCS = {
  1: "/assets/images/game/n1.png",
  2: "/assets/images/game/n2.png",
  3: "/assets/images/game/n3.png",
  4: "/assets/images/game/n4.png",
  5: "/assets/images/game/n5.png",
  6: "/assets/images/game/n6.png",
  7: "/assets/images/game/M.png",
}

const COLOR_COUNT = 7;

let getColorByValue = function (value) {
  var index = Math.ceil(value % COLOR_COUNT);
 
  return VALUE_COLORS[index];
}

let getTileImgSrcByValue = function(value){
  let index = Math.ceil(value % COLOR_COUNT);
  if (index == 0) {
    index = COLOR_COUNT;
  }
  return VALUE_IMG_SRCS[index];
}

module.exports = { getColorByValue, VALUE_COLORS, getTileImgSrcByValue};