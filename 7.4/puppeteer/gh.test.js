let page;

const defaultTestTimeout = 100000;
const defaultTimeout = 10000;
// defaultTimeout действует на:
// page.goBack() переопределится defaultNavigationTimeout
// page.goForward() переопределится defaultNavigationTimeout
// page.goto() переопределится defaultNavigationTimeout
// page.reload() переопределится defaultNavigationTimeout
// page.setContent() переопределится defaultNavigationTimeout
// page.waitFor()
// page.waitForFileChooser()
// page.waitForFunction()
// page.waitForNavigation() переопределится defaultNavigationTimeout
// page.waitForRequest()
// page.waitForResponse()
// page.waitForSelector()
// page.waitForXPath()
const defaultNavigationTimeout = 30000; // setDefaultNavigationTimeout имеет более высокий приоритет, чем setDefaultTimeout
// setDefaultNavigationTimeout действует на:
// page.goBack()
// page.goForward()
// page.goto()
// page.reload()
// page.setContent()
// page.waitForNavigation()

async function setPage(link) {
  page = await browser.newPage();
  await page.goto(link);
  page.setDefaultTimeout(defaultTimeout);
  page.setDefaultNavigationTimeout(defaultNavigationTimeout);
}

afterEach(() => {
  page.close();
});

describe("Github page tests", () => {
  beforeEach(async () => {
    await setPage("https://github.com/team");
  });

  test(
    "The h1 header content'",
    async () => {
      const firstLink = await page.$("header div div a");
      await firstLink.click();
      await page.waitForSelector("h1");
      const title2 = await page.title();
      expect(title2).toEqual(
        "GitHub: Where the world builds software · GitHub"
      );
    },
    defaultTestTimeout
  );

  test(
    "The first link attribute",
    async () => {
      const actual = await page.$eval("a", (link) => link.getAttribute("href"));
      expect(actual).toEqual("#start-of-content");
    },
    defaultTestTimeout
  );

  test(
    "The page contains Sign in button",
    async () => {
      const btnSelector = ".btn-large-mktg.btn-mktg";
      await page.waitForSelector(btnSelector, {
        visible: true,
      });
      const actual = await page.$eval(btnSelector, (link) => link.textContent);
      expect(actual).toContain("Sign up for free");
    },
    defaultTestTimeout
  );
});

beforeEach(async () => {
  await setPage("https://github.com/pricing");
});

test(
  "Join for free",
  async () => {
    const firstLink = await page.$('[test_selector="plan-input-free"]');
    await firstLink.click();
    await page.waitForSelector("#user_login");
    const title2 = await page.title();
    expect(title2).toEqual("Join GitHub · GitHub");
  },
  defaultTestTimeout
);

test(
  "Enterprise contact Sales",
  async () => {
    const firstLinks = await page.$x(
      '//h2[contains(text(), "Enterprise")]/..// a[contains(text(), "Contact Sales")]'
    );
    await firstLinks[0].click();
    await page.waitForSelector("#site_enterprise_contact_request_full_name");
    const title2 = await page.title();
    expect(title2).toEqual(
      "Enterprise · A smarter way to work together · GitHub"
    );
  },
  defaultTestTimeout
);

test(
  "Enterprise start a free trial",
  async () => {
    const firstLinks = await page.$x(
      '//h2[contains(text(), "Enterprise")]/..// a[contains(text(), "Start a free trial")]'
    );
    await firstLinks[0].click();
    await page.waitForXPath(
      '//p[contains(text(), "Recommended")]/..// h2[contains(text(), "Enterprise Cloud")]'
    );
    const title2 = await page.title();
    expect(title2).toEqual("Choose an Enterprise plan · GitHub");
  },
  defaultTestTimeout
);
