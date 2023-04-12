"use strict";

const { expect } = require("chai");
const { getTextBySelector } = require("../commands");

const titleSelector = "h2.ticket__check-title";
const movieTitleSelector = ".ticket__details.ticket__title";
// const ticketChairsSelector = ".ticket__details.ticket__chairs";
const movieStartSelector = ".ticket__details.ticket__start";
const hallTitleSelector = ".ticket__details.ticket__hall";
const qrImgSelector = "img.ticket__info-qr";

class QRPage {
  page;
  seance;

  constructor(page, seance) {
    this.page = page;
    this.seance = seance;
  }

  async checkPage() {
    await this.page.waitForSelector(qrImgSelector);

    const actualTitle = await getTextBySelector(this.page, titleSelector);
    expect(actualTitle.toLowerCase()).contain("электронный билет");

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
    expect(actualTimeStr).contain(this.seance.timeStr);
  }
}

module.exports = QRPage;
