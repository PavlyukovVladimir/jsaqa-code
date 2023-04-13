// #region require

const puppeteer = require("puppeteer");

const { expect } = require("chai");

var HomePage = require("../../lib/pages/home.page");

const {
  Given,
  When,
  Then,
  Before,
  After,
  setDefaultTimeout,
} = require("@cucumber/cucumber");

// #endregion require
// #region Before/after
setDefaultTimeout(30000);

Before(async function () {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 10,
    timeout: 30000,
  });
  this.browser = browser;
  const page = await browser.newPage();
  this.page = page;
  this.homePage = new HomePage(page, "http://qamid.tmweb.ru/client/index.php");
  await this.homePage.goToPage();
});

After(async function () {
  if (this.browser) {
    await this.browser.close();
  }
});

// #endregion Before/after
// #region Given

// Переход на страницу афиши
Given("user is on main page of tmweb", async function () {
  return await this.homePage.checkPage();
});

// #endregion Given
// #region When

// Когда пользователь случайным образом выбирает день не позднее заданного
When(
  "user randomly chooses one of {int} days starting from the next day",
  async function (int) {
    await this.homePage.randomlySelectWeekDay({ min: 2, max: int });
  }
);

// Когда пользователь случайным образом выбирает доступный сеанс
When("user randomly chooses one of available seance", async function () {
  this.chairsChoicePage = await this.homePage.randomlySelectSeance(true);
});

// Когда пользователь случайным образом выбирает недоступный сеанс
When(
  "user randomly selects a session that starts earlier than the current moment",
  async function () {
    const date = new Date();
    const timeNowStr = `${date.getHours()}:${date.getMinutes() + 1}`;
    this.chairsChoicePage = await this.homePage.randomlySelectSeanceBeforeTime(
      timeNowStr
    );
  }
);

// Когда пользователь случайным образом выбирает кресло
When("user randomly chooses one of available chair", async function () {
  const chair = await this.chairsChoicePage.getRandomFreeChair();
  await this.chairsChoicePage.selectChairs(chair);
  this.viewBookingPage = await this.chairsChoicePage.pressBookButton();
});

// Когда пользователь подтверждает бронирование
When("user will confirm the booking", async function () {
  this.qrPage = await this.viewBookingPage.pressBookButton();
});

// #endregion When
// #region Then

// Тогда пользователь видит афишу выбранного дня
Then("user sees the poster of the selected day", async function () {
  await this.homePage.checkSelectedWeekDay();
});

// Тогда пользователь видит страницу бронирования билетов
Then("user will see the ticket booking page", async function () {
  await this.chairsChoicePage.checkPage();
});

// Тогда пользователь видит страницу проверки забронированных билетов
Then("user sees the page for checking booked tickets", async function () {
  await this.viewBookingPage.checkPage();
});

// Тогда пользователь получит QR код
Then("user received a QR code", async function () {
  await this.qrPage.checkPage();
});

// Тогда пользователь останется на странице афиши текущего дня
Then(
  "user will remain on the current day's movie poster page",
  async function () {
    let errMsg;
    const time = 5000;
    try {
      await this.chairsChoicePage.checkPage(time);
    } catch (e) {
      errMsg = e.message;
    }

    expect(errMsg).to.contain(`Waiting failed: ${time}ms exceeded`);
  }
);

// #endregion Then
