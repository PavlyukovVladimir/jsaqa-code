"use strict";

const { expect } = require("chai");
var ChairsChoice = require("./chairs-choice");
const { getTextBySelector, getText, getClassName } = require("../commands");
const { boolFlagCheck } = require("../util");

const pageNavigationSelector = ".page-nav a";
const weekDaysSelector = ".page-nav__day";
const selectedDaySelector = ".page-nav__day.page-nav__day_chosen";
const currentDaySelector = ".page-nav__day.page-nav__day_today";
const movieSelector = ".movie";
const movieTitleSelector = ".movie__description .movie__title";
const hallSelector = ".movie-seances__hall";
const hallTitleSelector = ".movie-seances__hall-title";
const timeSelector = ".movie-seances__time";
const timeDisabledClassName = "acceptin-button-disabled";

class Home {
  page;
  baseUrl;
  selectedWeekDayNumber;

  constructor(page, baseUrl) {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  async goToHomePage() {
    await this.page.goto(this.baseUrl);
    await this.checkHomePage();
    this.selectedWeekDayNumber = 1;
    return this;
  }

  async checkHomePage() {
    await this.page.waitForSelector(pageNavigationSelector);
    expect(await this.page.$$(weekDaysSelector)).to.have.lengthOf(7);
    return this;
  }

  async selectWeekDay(num) {
    const selector = `${pageNavigationSelector}:nth-of-type(${num})`;
    await this.page.waitForSelector(selector);
    await this.page.click(selector);
    this.selectedWeekDayNumber = num;
    return this;
  }

  async randomlySelectWeekDay() {
    const n = Math.floor(Math.random() * 7) + 1;
    await this.selectWeekDay(n);
    return this;
  }

  async checkSelectedWeekDay() {
    await this.page.waitForSelector(
      `${pageNavigationSelector}:nth-of-type(${this.selectedWeekDayNumber}).page-nav__day_chosen`
    );
    return this;
  }

  /**
   *
   * @param {*} status if false returns only the disable seances, if true - only the active, other - both
   * @returns
   */
  async getSeances(status) {
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
          if (boolFlagCheck(true, status, isActive)) {
            arr.push(seance);
          }
          // console.log(arr[arr.length - 1]);
        }
      }
    }
    return arr;
  }

  async selectSeance(num, status) {
    let seances = await this.getSeances(status);
    if (num > seances.length) {
      throw new Error(
        `Not enouth seances it count ${seances.length}, needs ${num} or gretter`
      );
    }
    await this.page.click(
      timeSelector + `:nth-of-type(${seances[num - 1].nth})`
    );
    return new ChairsChoice(this.page, seances[num - 1]);
  }
}

module.exports = Home;
