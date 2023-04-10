module.exports = {
  generateName: function (length) {
    let name = ""; //здесь будем хранить результат
    let chars = "abcdefgABCDEFG1234567890"; //возможные символы
    let charLength = chars.length; //определяем длину
    for (let i = 0; i < length; i++) {
      //запускаем цикл для формирования строки
      name += chars.charAt(Math.floor(Math.random() * charLength));
    }
    return name;
  },
  getCurrentDayTimestamp() {
    let now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return Math.floor(now.getTime() / 1000);
  },
  dayShift(timestamp, days) {
    return Math.floor(timestamp + days * 24 * 60 * 60);
  },
  shuffle(array) {
    // Перемешивает элементы массива
    let m = array.length,
      t,
      i;

    // Пока есть элементы для перемешивания
    while (m) {
      // Взять оставшийся элемент
      i = Math.floor(Math.random() * m--);

      // И поменять его местами с текущим элементом
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  },
};
