"use strict";

const { expect } = require("chai");
const { getTextBySelector } = require("../commands");
const QRPage = require("./qr.page");

const titleSelector = "h2.ticket__check-title";
const movieTitleSelector = ".ticket__details.ticket__title";
// const ticketChairsSelector = ".ticket__details.ticket__chairs";
const movieStartSelector = ".ticket__details.ticket__start";
const hallTitleSelector = ".ticket__details.ticket__hall";
// const ticketCostSelector = ".ticket__details.ticket__cost";

const bookButtonSelector = "button.acceptin-button";

class ViewBookingPage {
  page;
  seance;

  constructor(page, seance) {
    this.page = page;
    this.seance = seance;
  }

  async checkPage() {
    await this.page.waitForSelector(titleSelector);

    const actualTitle = await getTextBySelector(this.page, titleSelector);
    expect(actualTitle.toLowerCase()).to.contain("вы выбрали билеты:");

    const actualMovieTitle = await getTextBySelector(
      this.page,
      movieTitleSelector
    );
    expect(actualMovieTitle).to.contain(this.seance.movieTitle);

    const actualHallTitle = await getTextBySelector(
      this.page,
      hallTitleSelector
    );
    expect(actualHallTitle).to.contain(this.seance.hallTitle);

    const actualTimeStr = await getTextBySelector(
      this.page,
      movieStartSelector
    );
    expect(actualTimeStr).to.contain(this.seance.timeStr);
  }

  async pressBookButton() {
    await this.page.waitForSelector(bookButtonSelector);
    const is_disabled =
      (await this.page.$(`${bookButtonSelector}[disabled]`)) !== null;
    expect(is_disabled, "Button is disabled").to.be.false;
    await this.page.click(bookButtonSelector);
    return new QRPage(this.page, this.seance);
  }
}

module.exports = ViewBookingPage;
