"use strict";

const { expect } = require("chai");
var ChairsChoice = require("./chairs-choice");
const { getText } = require("../lib/commands");

module.exports = class Home {
  weekDaysSelector = ".page-nav__day";
  selectedDaySelector = ".page-nav__day.page-nav__day_chosen";
  currentDaySelector = ".page-nav__day.page-nav__day_today";
  selectedWeekDayNumber = undefined;
  baseUrl = undefined;
  page = undefined;

  movieSelector = ".movie";
  movieTitleSelector = ".movie__description.movie__title";
  hallSelector = ".movie-seances__hall";
  hallTitleSelector = ".movie-seances__hall-title";
  timeSelector = ".movie-seances__time";

  constructor(page, baseUrl) {
    this.baseUrl = baseUrl;
    this.page = page;
  }

  async goToHomePage() {
    await page.goto(this.baseUrl);
    await this.checkHomePage();
    this.selectedWeekDayNumber = 1;
    return this;
  }

  async checkHomePage() {
    await page.waitForSelector(".page-nav a");
    expect(await page.$$(this.weekDaysSelector)).to.have.lengthOf(7);
    return this;
  }

  async selectWeekDay(num) {
    await page.click(`.page-nav a:nth-of-type(${num})`);
    this.selectedWeekDayNumber = num;
    return this;
  }

  async randomlySelectWeekDay() {
    const n = Math.floor(Math.random() * 7) + 1;
    await this.selectWeekDay(n);
    return this;
  }

  async checkSelectedWeekDay() {
    await page.waitForSelector(
      `.page-nav a:nth-of-type(${this.selectedWeekDayNumber}).page-nav__day_chosen`
    );
    return this;
  }

  async getSeances() {
    let arr = [];
    let i = 0;
    const movies = await this.page.$$(".movie");
    console.log(movies);
    for (let mov of movies) {
      let movieTitle = await getText(
        mov,
        ".movie__description .movie__title"
      );
      console.log("ggg" + movieTitle);
      // let halls = mov.querySelectorAll(".movie-seances__hall");
      // for (let hall of halls) {
      //   let hallTitle = hall.querySelector(
      //     ".movie-seances__hall-title"
      //   ).textContent;
      //   let times = hall.querySelectorAll(".movie-seances__time");
      //   for (let time of times) {
      //     let timeStr = time.textContent;
      //     arr.push({
      //       movieTitle,
      //       hallTitle,
      //       timeStr,
      //       nth: ++i,
      //     });
      //   }
      // }
    }
    return this;
  }

  async selectSeance(num) {
    let seances = await this.getSeances();
    if (num > seances.length) {
      throw new Error(
        `Not enouth seances it count ${seances.length}, needs ${num} or gretter`
      );
    }
    await this.page.click(
      this.timeSelector + `:nth-of-type(${seances[num - 1].nth})`
    );
    return new ChairsChoice(this.page, seances[num - 1]);
  }
};
