const { shuffle } = require("./util.js");
module.exports = {
  clickElement: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      await page.click(selector);
    } catch (error) {
      throw new Error(`Selector is not clickable: ${selector}`);
    }
  },

  getText: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      return await page.$eval(selector, (link) => link.textContent);
    } catch (error) {
      throw new Error(`Text is not available for selector: ${selector}`);
    }
  },

  putText: async function (page, selector, text) {
    try {
      const inputField = await page.$(selector);
      await inputField.focus();
      await inputField.type(text);
      await page.keyboard.press("Enter");
    } catch (error) {
      throw new Error(`Not possible to type text for selector: ${selector}`);
    }
  },

  getSeances: function (page) {
    return page.evaluate(() => {
      let arr = [];
      for (let el of document.querySelectorAll("a.movie-seances__time")) {
        arr.push({
          ts: el.getAttribute("data-seance-time-stamp"),
          disable: el.getAttribute("class").includes("disabled"),
        });
      }
      return arr;
    });
  },

  getChairs: function (page) {
    // Получит все места
    return page.evaluate(() => {
      let arr = [];
      let rows = document.querySelectorAll(".buying-scheme__row");
      let length = rows.length;
      for (let i = 0; i < length; i++) {
        rows = document.querySelectorAll(`.buying-scheme__row:nth-child(${i + 1}) .buying-scheme__chair`);
        let trow = [];

        for (let j = 0; j < rows.length; j++) {
          let classString = rows[j].getAttribute("class");

          trow.push({
            row: i,
            chair: j,
            vip: classString.includes("buying-scheme__chair_vip"),
            standart: classString.includes("buying-scheme__chair_standart"),
            taken: classString.includes("buying-scheme__chair_taken"),
            disabled: classString.includes("buying-scheme__chair_disabled"),
          });
        }

        arr.push(trow);
      }

      return arr;
    });
  },

  getFreeChairs: function (arr, count, type) {
    // Выташит count свободных мест из arr
    let tArr = [];
    for (let row of arr) {
      for (let chair of row) {
        if (!chair.taken && !chair.disable) {
          if (type === "any") {
            tArr.push(chair);
            continue;
          }
          if (type === "vip") {
            if (chair.vip) {
              tArr.push(chair);
            }
            continue;
          }
          if (type === "standart") {
            if (chair.standart) {
              tArr.push(chair);
            }
            continue;
          }
          throw new Error(
            `Unknown type: "${type}". It must be from an array: ["any", "vip", "standart"]`
          );
        }
      }
    }
    let length = tArr.length;
    if (count > length) {
      throw new Error(
        `There are not enough tickets, there are ${length}, but it needs ${count}`
      );
    }
    return shuffle(tArr).slice(0, count);
  },
};
