"use strict";

const { expect } = require("chai");
const { getTextBySelector, getClassName } = require("../commands");
const { boolFlagCheck, getRndInteger } = require("../util");
const ViewBookingPage = require("./view-booking.page");

const movieTitleSelector = "h2.buying__info-title";
const movieStartSelector = "p.buying__info-start";
const hallTitleSelector = "p.buying__info-hall";
const rowSelector = "div.buying-scheme__row";

const chairSelector = "span.buying-scheme__chair";

const vipClassName = "buying-scheme__chair_vip";
const standartClassName = "buying-scheme__chair_standart";
const disableClassName = "buying-scheme__chair_disabled";

const selectedClassName = "buying-scheme__chair_selected";
const takenClassName = "buying-scheme__chair_taken";

const bookButtonSelector = "button.acceptin-button";

class ChairsChoice {
  page;
  seance;

  constructor(page, seance) {
    this.page = page;
    this.seance = seance;
  }

  async checkPage(time) {
    const timeoutNow = this.page.getDefaultTimeout();
    if (time === undefined || !Number.isInteger(time)) {
      time = timeoutNow;
    }

    await this.page.waitForSelector(rowSelector, { timeout: time });

    const actualMovieTitle = await getTextBySelector(
      this.page,
      movieTitleSelector
    );
    expect(actualMovieTitle).contain(this.seance.movieTitle);

    const actualHallTitle = await getTextBySelector(
      this.page,
      hallTitleSelector
    );
    expect(actualHallTitle).contain(this.seance.hallTitle);

    const actualTimeStr = await getTextBySelector(
      this.page,
      movieStartSelector
    );
    expect(actualTimeStr).contain(`Начало сеанса: ${this.seance.timeStr}`);
    return this;
  }

  async getAllChairs() {
    const rows = await this.page.$$(rowSelector);
    const rowsLength = await rows.length;
    const matrix = [];
    for (let i = 0; i < rowsLength; i++) {
      const row = await rows[i];
      const chairs = await row.$$(chairSelector);
      const chairsLength = await chairs.length;
      const arr = [];
      for (let j = 0; j < chairsLength; j++) {
        const chair = await chairs[j];
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

  async _queryToMatrix({ isDisable, isStandart, isVip, isTaken, isSelected }) {
    const matrix = await this.getAllChairs();
    const arr = [];
    const rowLength = matrix.length;
    for (let i = 0; i < rowLength; i++) {
      const row = matrix[i];
      const columnLength = row.length;
      for (let j = 0; j < columnLength; j++) {
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
    const arg = { isDisable: false, isTaken: false };
    return await this._queryToMatrix(arg);
  }

  async selectChairs(chairs) {
    if (Array.isArray(chairs)) {
      for (let chair of chairs) {
        const row = chair.row;
        const chairNum = chair.chair;
        await this.selectElement(row, chairNum);
      }
    } else {
      const row = chairs.row;
      const chairNum = chairs.chair;
      await this.selectChair(row, chairNum);
    }
    return this;
  }

  async selectChair(rowNum, chairNum) {
    const selector =
      rowSelector +
      `:nth-child(${rowNum}) ` +
      chairSelector +
      `:nth-child(${chairNum})`;
    await this.page.waitForSelector(selector);
    await this.page.click(selector);
    await this.page.waitForSelector(selector + "." + selectedClassName);
    return this;
  }

  async getRandomFreeChair() {
    const arr = await this.getFreeChairs();
    expect(arr, "No free chairs")
      .to.be.an("array")
      .that.to.have.lengthOf.at.greaterThanOrEqual(1);
    return arr[getRndInteger(0, arr.length - 1)];
  }

  async pressBookButton() {
    await this.page.waitForSelector(bookButtonSelector);
    const is_disabled =
      (await this.page.$(`${bookButtonSelector}[disabled=true]`)) !== null;
    expect(is_disabled, "Button is disabled").to.be.false;
    await this.page.click(bookButtonSelector);
    return new ViewBookingPage(this.page, this.seance);
  }
}

module.exports = ChairsChoice;
