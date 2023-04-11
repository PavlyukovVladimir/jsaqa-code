var Home = require("./lib/pages/home");
var ChairsChoice = require("./lib/pages/chairs-choice");
const {
  clickElement,
  putText,
  getTextBySelector,
  getFreeChairs,
  getSeances,
  getChairs,
} = require("./lib/commands");
const { getCurrentDayTimestamp } = require("./lib/util");

const { expect } = require("chai");

let page;

afterEach(() => {
  page.close();
});

describe("task1", () => {
  let currentDayTimestamp;
  let otherDayTimestamp;

  beforeAll(() => {
    currentDayTimestamp = getCurrentDayTimestamp();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto("http://qamid.tmweb.ru/client/index.php");
    await page.waitForSelector(".page-nav a");
    
  });

  test("Current day ticket booking", async () => {
    // получить сеансы
    let seances = await getSeances(page);
    // отделить те что должны быть доступны к бронированию
    let availableSeances = await seances.filter(
      (seance) => seance.ts > Math.floor(2 + Date.now() / 1000)
    );
    let length = await availableSeances.length;
    if (length > 0) {
      // кликнуть случайный доступный сеанс
      let timestamp = await availableSeances[Math.floor(Math.random() * length)]
        .ts;

      (
        await page.$(
          `a.movie-seances__time[data-seance-time-stamp="${timestamp}"]`
        )
      ).click();
      await page.waitForSelector(".buying-scheme__row");

      const actual1 = await getTextBySelector(page, ".buying__info-start");
      expect(actual1).contain("Начало сеанса");

      // получить места
      let chairs = await getChairs(page);
      // выбрать любое доступное к заказу
      let chair = await getFreeChairs(chairs, 1, "any")[0];
      await page.click(
        `.buying-scheme__row:nth-child(${
          chair.row + 1
        }) .buying-scheme__chair:nth-child(${chair.chair + 1})`
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
      // дождаться появления заголовка блока проверки билетов
      await page.waitForSelector("h2.ticket__check-title");

      const actual2 = await getTextBySelector(page, "h2.ticket__check-title");
      expect(actual2).contain("Вы выбрали билеты");

      // кликнуть кнопку бронирования
      (await page.$(".acceptin-button")).click();
      // дождаться появления QR картинки
      await page.waitForSelector("img.ticket__info-qr");

      const actual3 = await getTextBySelector(page, "h2.ticket__check-title");
      expect(actual3).contain("Электронный билет");
    }
  });

  test("Not posible ticket booking for seances that have been started", async () => {
    // получить сеансы
    let seances = await getSeances(page);
    // отобрать те что должны быть недоступными к бронированию
    let notAvailableSeances = await seances.filter(
      (seance) => seance.ts < Math.floor(Date.now() / 1000)
    );
    let length = await notAvailableSeances.length;
    if (length > 0) {
      // попробовать перейти на страницу бронирования
      let timestamp = await notAvailableSeances[
        Math.floor(Math.random() * length)
      ].ts;

      await page.click(
        `a.movie-seances__time[data-seance-time-stamp="${timestamp}"]`
      );

      await page.waitForTimeout(2000);

      // клик по сеансам до настоящего времени никуда не переместит
      // проверка состоит в удачном ожидании элемента присущего этой же странице, спустя таймаут
      await page.waitForSelector("a.page-nav__day_today.page-nav__day_chosen", {
        timeout: 1000,
      });
    }
  });

  test("One of next days ticket booking", async () => {
    let shiftDays = Math.floor(Math.random() * 6) + 1;
    otherDayTimestamp = (await currentDayTimestamp) + shiftDays * 24 * 60 * 60;

    let selector = `.page-nav a[data-time-stamp="${otherDayTimestamp}"]`;
    (await page.$(selector)).click();
    await page.waitForSelector(
      `.page-nav a.page-nav__day_chosen[data-time-stamp="${otherDayTimestamp}"]`
    );
    // получить сеансы
    let seances = await getSeances(page);
    // отделить те что должны быть доступны к бронированию
    let availableSeances = await seances.filter(
      (seance) => seance.ts > Math.floor(2 + Date.now() / 1000)
    );
    let length = await availableSeances.length;
    if (length > 0) {
      // кликнуть случайный доступный сеанс
      let timestamp = await availableSeances[Math.floor(Math.random() * length)]
        .ts;

      (
        await page.$(
          `a.movie-seances__time[data-seance-time-stamp="${timestamp}"]`
        )
      ).click();
      await page.waitForSelector(".buying-scheme__row");

      const actual1 = await getTextBySelector(page, ".buying__info-start");
      expect(actual1).contain("Начало сеанса");

      // получить места
      let chairs = await getChairs(page);
      // выбрать любое доступное к заказу
      let chair = await getFreeChairs(chairs, 1, "any")[0];
      await page.click(
        `.buying-scheme__row:nth-child(${
          chair.row + 1
        }) .buying-scheme__chair:nth-child(${chair.chair + 1})`
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
      // дождаться появления заголовка блока проверки билетов
      await page.waitForSelector("h2.ticket__check-title");

      const actual2 = await getTextBySelector(page, "h2.ticket__check-title");
      expect(actual2).contain("Вы выбрали билеты");

      // кликнуть кнопку бронирования
      (await page.$(".acceptin-button")).click();
      // дождаться появления QR картинки
      await page.waitForSelector("img.ticket__info-qr");

      const actual3 = await getTextBySelector(page, "h2.ticket__check-title");
      expect(actual3).contain("Электронный билет");
    }
  });

  test.only("test", async () => {
    const homePage = new Home(page, "http://qamid.tmweb.ru/client/index.php");
    await homePage.goToHomePage();
    await homePage.checkHomePage();
    // await homePage.randomlySelectWeekDay();
    await homePage.checkSelectedWeekDay();
    console.log(await homePage.getSeances(false));
  });
});
