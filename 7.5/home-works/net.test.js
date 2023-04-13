var HomePage = require("./lib/pages/home.page");
const { expect } = require("chai");

let page;
let homePage;

afterEach(() => {
  page.close();
});

describe("task1", () => {
  beforeEach(async () => {
    page = await browser.newPage();
    homePage = new HomePage(page, "http://qamid.tmweb.ru/client/index.php");
    await homePage.goToPage();
    await homePage.checkPage();
  });

  test("Current day ticket booking", async () => {
    const chairsChoicePage = await homePage.randomlySelectSeance(true);
    await chairsChoicePage.checkPage();

    const chair = await chairsChoicePage.getRandomFreeChair();
    await chairsChoicePage.selectChairs(chair);
    const viewBookingPage = await chairsChoicePage.pressBookButton();
    await viewBookingPage.checkPage();
    
    const qrPage = await viewBookingPage.pressBookButton();
    await qrPage.checkPage();
  });

  test("Not posible ticket booking for seances that have been started", async () => {
    const date = new Date();
    const timeNowStr = `${date.getHours()}:${date.getMinutes() + 1}`;
    const chairsChoicePage = await homePage.randomlySelectSeanceBeforeTime(
      timeNowStr
    );

    let errMsg;
    const time = 5000;
    try {
      await chairsChoicePage.checkPage(time);
    } catch (e) {
      errMsg = e.message;
    }

    expect(errMsg).to.contain(`Waiting failed: ${time}ms exceeded`);
  });

  test("One of next days ticket booking", async () => {

    await homePage.randomlySelectWeekDay({ min: 2 });
    await homePage.checkSelectedWeekDay();

    const chairsChoicePage = await homePage.randomlySelectSeance(true);
    await chairsChoicePage.checkPage();

    const chair = await chairsChoicePage.getRandomFreeChair();
    await chairsChoicePage.selectChairs(chair);
    const viewBookingPage = await chairsChoicePage.pressBookButton();
    await viewBookingPage.checkPage();

    const qrPage = await viewBookingPage.pressBookButton();
    await qrPage.checkPage();
  });
});
