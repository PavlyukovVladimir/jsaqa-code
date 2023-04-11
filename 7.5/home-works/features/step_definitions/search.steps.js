// #region require

const puppeteer = require("puppeteer");
const chai = require("chai");
const expect = chai.expect;
const {
  Given,
  When,
  Then,
  Before,
  After,
  setDefaultTimeout,
} = require("@cucumber/cucumber");
const {
  getText,
  getFreeChairs,
  getSeances,
  getChairs,
} = require("../../lib/commands.js");
const { getCurrentDayTimestamp } = require("../../lib/util.js");
setDefaultTimeout(30000);
// #endregion require
// #region Before/after

Before(async function () {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 10,
    timeout: 100000,
  });
  this.browser = browser;
  const page = await browser.newPage();
  this.page = page;
  this.currentDayTimestamp = getCurrentDayTimestamp();
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
  return await this.page.goto(`http://qamid.tmweb.ru/client/index.php`, {
    setTimeout: 10000,
  });
});

// #endregion Given
// #region When

// Когда пользователь случайным образом выбирает день не позднее заданного
When(
  "user randomly chooses one of {int} days starting from the next day",
  async function (int) {
    let shiftDays = Math.floor(Math.random() * int) + 1;
    this.otherDayTimestamp =
      this.currentDayTimestamp + shiftDays * 24 * 60 * 60;

    let selector = `.page-nav a[data-time-stamp="${this.otherDayTimestamp}"]`;
    (await this.page.$(selector)).click();
  }
);

// Когда пользователь случайным образом выбирает доступный сеанс
When("user randomly chooses one of available seance", async function () {
  const page = await this.page;
  const seances = await getSeances(page);
  const currentMomentTimestsmp = Math.floor(2 + Date.now() / 1000);
  const availableSeances = await seances.filter(
    (seance) => seance.ts > currentMomentTimestsmp
  );
  const length = await availableSeances.length;
  // кликнуть случайный доступный сеанс
  let timestamp = await availableSeances[Math.floor(Math.random() * length)].ts;

  (
    await page.$(`a.movie-seances__time[data-seance-time-stamp="${timestamp}"]`)
  ).click();
  await page.waitForSelector(".buying-scheme__row");
});

// Когда пользователь случайным образом выбирает недоступный сеанс
When("user randomly chooses one of unavailable seance", async function () {
  const page = await this.page;
  const seances = await getSeances(page);
  const currentMomentTimestsmp = Math.floor(Date.now() / 1000);
  const availableSeances = await seances.filter(
    (seance) => seance.ts < currentMomentTimestsmp
  );
  const length = await availableSeances.length;
  // кликнуть случайный доступный сеанс
  this.seanceTimestamp = await availableSeances[
    Math.floor(Math.random() * length)
  ].ts;
  (
    await page.$(
      `a.movie-seances__time[data-seance-time-stamp="${await this
        .seanceTimestamp}"]`
    )
  ).click();
});

// Когда пользователь случайным образом выбирает кресло
When("user randomly chooses one of available chair", async function () {
  const page = await this.page;

  // получить места
  let chairs = await getChairs(page);
  // выбрать любое доступное к заказу
  let chair = await getFreeChairs(chairs, 1, "any")[0];
  await page.click(
    `.buying-scheme__row:nth-child(${await (chair.row +
      1)}) .buying-scheme__chair:nth-child(${await (chair.chair + 1)})`
  );
  // подождать пока место станет отмеченным
  await page.waitForSelector(
    `.buying-scheme__row:nth-child(${
      chair.row + 1
    }) .buying-scheme__chair:nth-child(${
      chair.chair + 1
    }).buying-scheme__chair_selected`
  );
  // Кликнуть кнопку "забронировать"
  await page.click(".acceptin-button");
});

// Когда пользователь подтверждает бронирование
When("user will confirm the booking", async function () {
  const page = await this.page;

  // кликнуть кнопку бронирования
  (await page.$(".acceptin-button")).click();
});

// #endregion When
// #region Then

// Тогда пользователь видит афишу выбранного дня
Then("user sees the poster of the selected day", async function () {
  await this.page.waitForSelector(
    `.page-nav a.page-nav__day_chosen[data-time-stamp="${this.otherDayTimestamp}"]`
  );
});

// Тогда пользователь видит страницу бронирования билетов
Then("user will see the ticket booking page", async function () {
  await this.page.waitForSelector(".buying-scheme__row");

  const actual1 = await getText(this.page, ".buying__info-start");
  expect(actual1).contain("Начало сеанса");
});

// Тогда пользователь видит страницу проверки забронированных билетов
Then("user sees the page for checking booked tickets", async function () {
  const page = await this.page;

  // дождаться появления заголовка блока проверки билетов
  await page.waitForSelector("h2.ticket__check-title");

  const actual2 = await getText(page, "h2.ticket__check-title");
  expect(actual2).contain("Вы выбрали билеты");
});

// Тогда пользователь получит QR код
Then("user received a QR code", async function () {
  const page = await this.page;

  // дождаться появления QR картинки
  await page.waitForSelector("img.ticket__info-qr");

  const actual3 = await getText(page, "h2.ticket__check-title");
  expect(actual3).contain("Электронный билет");
});

// Тогда пользователь останется на странице афиши текущего дня
Then(
  "user will remain on the current day's movie poster page",
  async function () {
    const page = await this.page;

    await page.waitForTimeout(2000);

    await page.waitForSelector(
      `a.acceptin-button-disabled.movie-seances__time[data-seance-time-stamp="${await this
        .seanceTimestamp}"]`
    );

    // клик по сеансам до настоящего времени никуда не переместит
    // проверка состоит в удачном ожидании элемента присущего этой же странице, спустя таймаут
    await page.waitForSelector("a.page-nav__day_today.page-nav__day_chosen", {
      timeout: 1000,
    });
  }
);

// #endregion Then
