module.exports = {
  boolFlagCheck(flag, value, match) {
    if (flag === false) {
      return false;
    }
    if (value !== true && value !== false) {
      return true;
    } else if (value === match) {
      return true;
    }
    return false;
  },

  getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  hhmmToMinute(timeStr) {
    const timeBlocks = timeStr.split(":");
    const hh = Number.parseInt(timeBlocks[0]);
    const mm = Number.parseInt(timeBlocks[1]);
    return hh * 60 + mm;
  },
};
