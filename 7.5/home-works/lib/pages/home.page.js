"use strict";

const { expect } = require("chai");
var ChairsChoicePage = require("./chairs-choice.page");
const { getTextBySelector, getText, getClassName } = require("../commands");
const { boolFlagCheck, getRndInteger } = require("../util");

const pageNavigationSelector = ".page-nav a";
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
    await this.page.waitForSelector(pageNavigationSelector);
    expect(await this.page.$$(weekDaysSelector)).to.have.lengthOf(7);
    return this;
  }

  async selectWeekDay(num) {
    await this.page.waitForSelector(pageNavigationSelector);
    const elements = await this.page.$$(pageNavigationSelector);
    await elements[num].click();
    this.selectedWeekDayNumber = num;
    return this;
  }

  async randomlySelectWeekDay() {
    const n = Math.floor(Math.random() * 7) + 1;
    await this.selectWeekDay(n);
    return this;
  }

  async checkSelectedWeekDay() {
    await this.page.waitForSelector(pageNavigationSelector);
    const elements = await this.page.$$(pageNavigationSelector);
    const element = await elements[this.selectedWeekDayNumber - 1];
    const className = await getClassName(element);
    expect(className).to.contain(selectedDayClassName);
    return this;
  }

  async checkCurrentWeekDay() {
    await this.page.waitForSelector(pageNavigationSelector);
    const elements = await this.page.$$(pageNavigationSelector);
    const element = await elements[this.selectedWeekDayNumber - 1];
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

  async selectSeanceWithDisableCheck(seance) {
    await this.page.waitForSelector(timeSelector);
    const elements = await this.page.$$(timeSelector);
    const element = await elements[seance.nth];
    const is_disabled =
      (await getElementAttribute(element, "disable")) !== null;
    expect(is_disabled, "Seance is disabled").to.be.false;
    await this.page.click(selector);
    return new ChairsChoicePage(this.page, seance);
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
