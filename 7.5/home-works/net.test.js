const {
  clickElement,
  putText,
  getText,
  getFreeChairs,
  getSeances,
  getChairs,
} = require("./lib/commands.js");
const { generateName, getCurrentDayTimestamp } = require("./lib/util.js");

const chai = require("chai");
const expect = chai.expect;

let page;

beforeEach(async () => {
  page = await browser.newPage();
  page.setDefaultNavigationTimeout(0);
});

afterEach(() => {
  page.close();
});

// #region examples

describe.skip("Netology.ru tests", () => {
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto("https://netology.ru");
  });

  test("The first test'", async () => {
    const title = await page.title();
    console.log("Page title: " + title);
    await clickElement(page, "header a + a");
    const title2 = await page.title();
    console.log("Page title: " + title2);
    const pageList = await browser.newPage();
    await pageList.goto("https://netology.ru/navigation");
    await pageList.waitForSelector("h1");
  });

  test("The first link text 'Медиа Нетологии'", async () => {
    const actual = await getText(page, "header a + a");
    expect(actual).toContain("Медиа Нетологии");
  });

  test("The first link leads on 'Медиа' page", async () => {
    await clickElement(page, "header a + a");
    const actual = await getText(page, ".logo__media");
    await expect(actual).toContain("Медиа");
  });
});

test.skip("Should look for a course", async () => {
  await page.goto("https://netology.ru/navigation");
  await putText(page, "input", "тестировщик");
  const actual = await page.$eval("a[data-name]", (link) => link.textContent);
  const expected = "Тестировщик ПО";
  expect(actual).toContain(expected);
});

test.skip("Should show warning if login is not email", async () => {
  await page.goto("https://netology.ru/?modal=sign_in");
  await putText(page, 'input[type="email"]', generateName(5));
});

// #endregion

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

      const actual1 = await getText(page, ".buying__info-start");
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

      const actual2 = await getText(page, "h2.ticket__check-title");
      expect(actual2).contain("Вы выбрали билеты");

      // кликнуть кнопку бронирования
      (await page.$(".acceptin-button")).click();
      // дождаться появления QR картинки
      await page.waitForSelector("img.ticket__info-qr");

      const actual3 = await getText(page, "h2.ticket__check-title");
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

      const actual1 = await getText(page, ".buying__info-start");
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

      const actual2 = await getText(page, "h2.ticket__check-title");
      expect(actual2).contain("Вы выбрали билеты");

      // кликнуть кнопку бронирования
      (await page.$(".acceptin-button")).click();
      // дождаться появления QR картинки
      await page.waitForSelector("img.ticket__info-qr");

      const actual3 = await getText(page, "h2.ticket__check-title");
      expect(actual3).contain("Электронный билет");
    }
  });
});
