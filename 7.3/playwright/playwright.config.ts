import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    browserName: "chromium",
    launchOptions: {
      headless: false,
      slowMo: 300,
      devtools: true,
    },
    actionTimeout: 0,
  },
  testDir: "./homeworktests",
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  reporter: 'html',
});
