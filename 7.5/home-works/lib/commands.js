module.exports = {
  getTextBySelector: async function (page, selector) {
    try {
      await page.waitForSelector(selector);
      return await page.$eval(selector, (link) => link.textContent);
    } catch (error) {
      throw new Error(`Text is not available for selector: ${selector}`);
    }
  },

  getText: async function (element) {
    return await (await element.getProperty("textContent")).jsonValue();
  },

  getClassName: async function (element) {
    return await (await element.getProperty("className")).jsonValue();
  },
};
