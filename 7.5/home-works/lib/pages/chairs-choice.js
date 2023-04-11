"use strict";

const { expect } = require("chai");
const { getTextBySelector: getText, getClassName } = require("../commands");
const { boolFlagCheck } = require("../util");

const movieTitleSelector = "h2.buying__info-title";
const movieStartSelector = "p.buying__info-start";
const hallTitleSelector = "p.buying__info-hall";
const rowSelector = ".buying-scheme__row";

const chairSelector = ".buying-scheme__chair";

const vipClassName = "buying-scheme__chair_vip";
const standartClassName = "buying-scheme__chair_standart";
const disableClassName = "buying-scheme__chair_disabled";

const selectedClassName = "buying-scheme__chair_selected";
const takenClassName = "buying-scheme__chair_taken";

class ChairsChoice {
  page;
  seance;

  constructor(page, seance) {
    this.page = page;
    this.seance = seance;
  }

  async checkChairsChoicePage() {
    await this.page.waitForSelector(rowSelector);

    const actualMovieTitle = await getText(this.page, movieTitleSelector);
    expect(actualMovieTitle).contain(this.seance.movieTitle);

    const actualHallTitle = await getText(this.page, hallTitleSelector);
    expect(actualHallTitle).contain(this.seance.hallTitle);

    const actualTimeStr = await getText(this.page, movieStartSelector);
    expect(actualTimeStr).contain(`Начало сеанса: ${this.seance.timeStr}`);
  }

  async getAllChairs() {
    const rows = await page.$$(rowSelector);
    const rowsLength = rows.length;
    const matrix = [];
    for (let i = 0; i < rowsLength; i++) {
      const row = rows[i];
      const chairs = await row.$$(chairSelector);
      const chairsLength = chairs.length;
      const arr = [];
      for (let j = 0; j < chairsLength; j++) {
        const chair = chairs[j];
        const classStr = await getClassName(chair);

        const isDisable = classStr.includes(disableClassName);
        const isStandart = classStr.includes(standartClassName);
        const isVip = classStr.includes(vipClassName);
        const isTaken = classStr.includes(takenClassName);
        const isSelected = classStr.includes(selectedClassName);

        arr.push({
          row: i + 1,
          chair: j + 1,
          isDisable,
          isStandart,
          isVip,
          isTaken,
          isSelected,
        });
      }
      matrix.push(arr);
    }
    return matrix;
  }

  async queryMatrix(isDisable, isStandart, isVip, isTaken, isSelected) {
    const matrix = await this.getAllChairs();
    const arr = [];
    const rowLength = matrix.length;
    for (let i = 0; i < rowLength; i++) {
      const row = matrix[i];
      const columnLength = row.length;
      for (let j = 0; i < columnLength; j++) {
        const element = row[j];
        let flag = true;
        flag = boolFlagCheck(flag, isDisable, element.isDisable);
        flag = boolFlagCheck(flag, isStandart, element.isStandart);
        flag = boolFlagCheck(flag, isVip, element.isVip);
        flag = boolFlagCheck(flag, isTaken, element.isTaken);
        flag = boolFlagCheck(flag, isSelected, element.isSelected);
        if (flag) {
          arr.push(element);
        }
      }
    }
    return arr;
  }

  async getFreeChairs() {
    return await this.queryMatrix({ isDisable: false, isTaken: false });
  }

  async selectChairs(chairs) {
    if (Array.isArray(chairs)) {
      for (let chair of chairs) {
        const row = chair.row;
        const chairNum = chair.chair;
        const selector =
          rowSelector +
          `:nth-of-type(${row}) ` +
          chairSelector +
          `:nth-of-type(${chairNum})`;
        await this.page.click(selector);
        await this.page.waitForSelector(selector + " ." + selectedClassName);
      }
    } else {
      const row = chairs.row;
      const chairNum = chairs.chair;
      const selector =
        rowSelector +
        `:nth-of-type(${row}) ` +
        chairSelector +
        `:nth-of-type(${chairNum})`;
      await this.page.click(selector);
      await this.page.waitForSelector(selector + " ." + selectedClassName);
    }
  }
}

module.exports = ChairsChoice;
