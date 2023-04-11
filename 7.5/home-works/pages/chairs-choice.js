"use strict";

const { expect } = require("chai");
const { getText } = require("../lib/commands");

module.exports = class ChairsChoice {
  movieTitleSelector = "h2.buying__info-title";
  movieStartSelector = "p.buying__info-start";
  hallTitleSelector = "p.buying__info-hall";

  constructor(page, seance) {
    this.seance = seance;
    this.page = page;
  }

  async checkChairsChoicePage() {
    await page.waitForSelector(".buying-scheme__row");

    const actualMovieTitle = await getText(this.page, this.movieTitleSelector);
    expect(actualMovieTitle).contain();

    const actualHallTitle = await getText(this.page, this.hallTitleSelector);
    expect(actualHallTitle).contain(this.seance.hallTitle);

    const actualTimeStr = await getText(this.page, movieStartSelector);
    expect(actualTimeStr).contain(`Начало сеанса: ${this.seance.timeStr}`);
    return this;
  }
};
