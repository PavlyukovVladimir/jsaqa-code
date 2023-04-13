"use strict";

const { expect } = require("chai");
var ChairsChoicePage = require("./chairs-choice.page");
const { getTextBySelector, getText, getClassName } = require("../commands");
const { boolFlagCheck, getRndInteger, hhmmToMinute } = require("../util");

const pageNavigationPrefix = "a:nth-child(";
const pageNavigationSuffix = ")";
const weekDaysSelector = ".page-nav__day";
const selectedDayClassName = "page-nav__day_chosen";
const currentDayClassName = "page-nav__day_today";
const movieSelector = ".movie";
const movieTitleSelector = ".movie__description .movie__title";
const hallSelector = ".movie-seances__hall";
const hallTitleSelector = ".movie-seances__hall-title";
const timeSelector = ".movie-seances__time";
const timeDisabledClassName = "acceptin-button-disabled";

class HomePage {
  page;
  baseUrl;
  selectedWeekDayNumber;

  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  async goToPage() {
    await this.page.goto(this.baseUrl);
    await this.checkPage();
    this.selectedWeekDayNumber = 1;
    return this;
  }

  async checkPage() {
    await this.page.waitForSelector(
      pageNavigationPrefix + 1 + pageNavigationSuffix
    );
    expect(await this.page.$$(weekDaysSelector)).to.have.lengthOf(7);
    return this;
  }

  async selectWeekDay(num) {
    const selector = pageNavigationPrefix + num + pageNavigationSuffix;
    await this.page.waitForSelector(selector);
    this.selectedWeekDayNumber = num;
    await this.page.click(selector);
    return this;
  }

  async randomlySelectWeekDay(arg) {
    if (arg === undefined) {
      arg = { min: 1, max: 7 };
    }
    let min = arg.min;
    let max = arg.max;

    if (min === undefined) {
      min = 1;
    }
    if (max === undefined) {
      max = 7;
    }
    expect(Number.isInteger(min)).to.be.true;
    expect(Number.isInteger(min)).to.be.true;
    expect(min).to.greaterThanOrEqual(1);
    expect(max).to.lessThanOrEqual(7);
    expect(min).to.lessThanOrEqual(max);
    const n = getRndInteger(min, max);
    await this.selectWeekDay(n);
    return this;
  }

  async checkSelectedWeekDay() {
    const num = this.selectedWeekDayNumber;
    const selector = pageNavigationPrefix + num + pageNavigationSuffix;
    await this.page.waitForSelector(selector);
    const element = await this.page.$(selector);
    const className = await getClassName(element);
    expect(className).to.contain(selectedDayClassName);
    return this;
  }

  async checkCurrentWeekDay() {
    const num = this.selectedWeekDayNumber;
    const selector = pageNavigationPrefix + num + pageNavigationSuffix;
    await this.page.waitForSelector(selector);
    const element = await this.page.$(selector);
    const className = await getClassName(element);
    expect(className).to.contain(currentDayClassName);
    return this;
  }

  /**
   *
   * @param {*} isAvailable if false returns only the disable seances, if true - only the active, other - both
   * @returns
   */
  async getSeances(isAvailable) {
    let arr = [];
    let i = 0;
    const movies = await this.page.$$(movieSelector);
    for (let mov of movies) {
      let movieTitle = await getTextBySelector(mov, movieTitleSelector);
      // console.log("Название фильма: " + movieTitle);
      let halls = await mov.$$(hallSelector);
      for (let hall of halls) {
        let hallTitle = await getTextBySelector(hall, hallTitleSelector);
        // console.log("Название зала: " + hallTitle);
        let times = await hall.$$(timeSelector);
        for (let time of times) {
          let timeStr = await getText(time);
          // console.log("Время: " + timeStr)
          let className = await getClassName(time);
          // console.log("Класс: " + className)
          let isActive = !className.includes(timeDisabledClassName);
          let seance = {
            movieTitle,
            hallTitle,
            timeStr,
            nth: ++i,
            isActive,
          };
          if (boolFlagCheck(true, isAvailable, isActive)) {
            arr.push(seance);
          }
          // console.log(arr[arr.length - 1]);
        }
      }
    }
    return arr;
  }

  async randomlySelectSeanceBeforeTime(timeStr) {
    const seances = await this.getSeances("all");
    expect(seances).not.to.be.empty;
    const targetSeances = seances.filter(
      (seance) => hhmmToMinute(seance.timeStr) < hhmmToMinute(timeStr)
    );
    expect(targetSeances).not.to.be.empty;
    const targetSeancesCount = targetSeances.length;
    const num = getRndInteger(0, targetSeancesCount - 1);
    const element = await this.getSeanceElement(targetSeances[num]);
    await element.click();
    return new ChairsChoicePage(this.page, seances[num]);
  }

  async getSeanceElement(seance) {
    return (await this.page.$$(timeSelector))[seance.nth - 1];
  }

  async randomlySelectSeance(isAvailable) {
    const seances = await this.getSeances(isAvailable);
    expect(seances).not.to.be.empty;
    const seanceCount = seances.length;
    const num = getRndInteger(0, seanceCount - 1);
    const element = await this.getSeanceElement(seances[num]);
    await element.click();
    return new ChairsChoicePage(this.page, seances[num]);
  }
}

module.exports = HomePage;
