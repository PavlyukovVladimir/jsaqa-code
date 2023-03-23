const { test, expect } = require("@playwright/test");
const userData = require("./../user.js");

var path = require("path");

async function screenshot_helper(page, currentTest, testFileName) {
  if (currentTest.status != "passed") {
    console.log("Trying to take a screenshot of " + currentTest.title);
    var screenshot_file_path = __dirname + "/screenshots/" + currentTest.title + ".png";
    await page.screenshot({ path: screenshot_file_path });
  }
}

test.afterEach(async ({ page }, testInfo) => {
  var testFileName = path.basename(__filename);
  await screenshot_helper(page, testInfo, testFileName);
});

test("test 1 «Успешная авторизация»", async ({ page }) => {
  const screenshot_file_path = __dirname + "/screenshots/";

  // Go to https://netology.ru/free/management#/
  await page.goto("https://netology.ru");

  await page.screenshot({ path: screenshot_file_path + "mainpage.png" });

  // Click "Войти"
  await page.click('//a[text()="Войти"]');
  await expect(page).toHaveURL("https://netology.ru/?modal=sign_in");

  await page.screenshot({ path: screenshot_file_path + "login.png" });

  // Fill email
  const emailInput = await page.$('input[name="email"]');
  emailInput.fill(userData.email);
  // Fill password
  const passwordInput = await page.$('input[name="password"]');
  passwordInput.fill(userData.password);
  // Click "Вход"
  const loginButton = await page.$('button[data-testid="login-submit-btn"]');
  loginButton.click();

  await expect(page).toHaveURL("https://netology.ru/profile");

  const h2 = page.locator('div[data-testid="profile-programs-content"] h2');
  await expect(h2).toContainText("Мои курсы и профессии");

  await page.screenshot({ path: screenshot_file_path + "profile.png" });
});

test("test 2 «Неуспешная авторизация»", async ({ page }) => {
  // Go to https://netology.ru/free/management#/
  await page.goto("https://netology.ru");

  // Click "Войти"
  await page.click('//a[text()="Войти"]');
  await expect(page).toHaveURL("https://netology.ru/?modal=sign_in");

  // Fill email
  const emailInput = await page.$('input[name="email"]');
  emailInput.fill("notme@gmail.com");
  // Fill password
  const passwordInput = await page.$('input[name="password"]');
  passwordInput.fill("qwerty12345");
  // Click "Вход"
  const loginButton = await page.$('button[data-testid="login-submit-btn"]');
  loginButton.click();

  const errorMessage = page.locator('[data-testid="login-error-hint"]');
  await expect(errorMessage).toContainText(
    "Вы ввели неправильно логин или пароль"
  );
});
