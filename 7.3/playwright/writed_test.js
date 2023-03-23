import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://netology.ru/');
  await page.getByTestId('header-top').getByRole('link').first().click();
  await page.getByRole('link', { name: 'Войти' }).click();
  await page.getByPlaceholder('Email').click();
  await page.getByPlaceholder('Email').fill('1234');
  await page.getByPlaceholder('Пароль').click();
  await page.getByPlaceholder('Пароль').fill('4321');
  await page.getByTestId('login-submit-btn').click();
});