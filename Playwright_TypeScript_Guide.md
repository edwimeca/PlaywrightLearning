# Playwright with TypeScript — Practical Command & Test Automation Guide

> A practical reference for installing, configuring, running, debugging, and writing Playwright tests with TypeScript.

---

## 1. What is Playwright?

[Playwright](https://playwright.dev/) is an end-to-end test automation framework from Microsoft. It supports Chromium, Firefox, and WebKit and can automate web browsers, API requests, screenshots, downloads, multiple pages, authentication flows, and more.

This guide focuses on **Playwright Test + TypeScript**.

---

# 2. Prerequisites

Install:

- Node.js (LTS recommended)
- npm
- A code editor such as VS Code

Verify the installation:

```bash
node --version
npm --version
```

---

# 3. Create a Playwright + TypeScript project

The easiest way to create a new project is:

```bash
npm init playwright@latest
```

The installer normally asks questions such as:

```text
Do you want to use TypeScript or JavaScript?
Where to put your end-to-end tests?
Add a GitHub Actions workflow?
Install Playwright browsers?
```

For a TypeScript project, select:

```text
TypeScript
```

A typical project looks like:

```text
my-playwright-project/
│
├── tests/
│   └── example.spec.ts
│
├── playwright.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
│
└── node_modules/
```

Install browsers if necessary:

```bash
npx playwright install
```

Install only Chromium:

```bash
npx playwright install chromium
```

Install all supported browsers and their dependencies:

```bash
npx playwright install --with-deps
```

---

# 4. Important files

## `playwright.config.ts`

This is the main Playwright configuration file.

Example:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  timeout: 30_000,

  expect: {
    timeout: 5_000,
  },

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: 'https://example.com',

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    headless: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

---

# 5. Basic test structure

A typical TypeScript test:

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Username').fill('testuser');
  await page.getByLabel('Password').fill('password');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Welcome')).toBeVisible();
});
```

The important concepts are:

- `test()` → defines a test.
- `page` → browser page/tab.
- `expect()` → assertions.
- `locator` → identifies elements.
- `await` → waits for asynchronous Playwright operations.

---

# 6. Running tests

## Run all tests

```bash
npx playwright test
```

---

## Run a specific test file

```bash
npx playwright test tests/login.spec.ts
```

---

## Run tests matching a name

```bash
npx playwright test -g "user can log in"
```

Short version:

```bash
npx playwright test --grep "user can log in"
```

---

## Run a specific project/browser

```bash
npx playwright test --project=chromium
```

Examples:

```bash
npx playwright test --project=firefox
npx playwright test --project=webkit
```

---

## Run in headed mode

Normally Playwright runs browsers headlessly.

To see the browser:

```bash
npx playwright test --headed
```

---

## Run with a specific number of workers

```bash
npx playwright test --workers=1
```

For example:

```bash
npx playwright test --workers=4
```

This controls parallel execution.

---

## Run a single test

Use the test title:

```bash
npx playwright test -g "user can log in"
```

Or target the file:

```bash
npx playwright test tests/login.spec.ts
```

---

# 7. Debugging tests

## Debug mode

```bash
npx playwright test --debug
```

This opens the browser and activates Playwright's debugging experience.

---

## Debug a specific file

```bash
npx playwright test tests/login.spec.ts --debug
```

---

## Pause execution

Inside a test:

```typescript
await page.pause();
```

Example:

```typescript
test('debug example', async ({ page }) => {
  await page.goto('https://example.com');

  await page.pause();

  await page.getByRole('button').click();
});
```

This is useful when you want to inspect the current page and locators interactively.

---

# 8. UI Mode

Playwright provides an interactive UI mode:

```bash
npx playwright test --ui
```

UI mode is useful for:

- Running individual tests
- Inspecting test steps
- Viewing traces
- Debugging failures
- Filtering tests
- Re-running tests

---

# 9. Generate tests with Codegen

Playwright can record browser actions:

```bash
npx playwright codegen https://example.com
```

It opens a browser and generates Playwright code while you interact with the page.

Example generated code:

```typescript
await page.goto('https://example.com');
await page.getByRole('textbox', { name: 'Search' }).fill('Playwright');
await page.getByRole('button', { name: 'Search' }).click();
```

Codegen is useful for learning and quickly creating a first version of a test.

However, generated code should normally be reviewed and cleaned up manually.

---

# 10. Locators

Locators are one of the most important Playwright concepts.

Recommended locators:

```typescript
page.getByRole()
page.getByLabel()
page.getByText()
page.getByPlaceholder()
page.getByAltText()
page.getByTitle()
page.getByTestId()
```

---

## `getByRole()`

Recommended when the element has an accessible role.

```typescript
page.getByRole('button', { name: 'Login' })
```

Examples:

```typescript
page.getByRole('link', { name: 'Home' });

page.getByRole('textbox', { name: 'Username' });

page.getByRole('checkbox', { name: 'Remember me' });

page.getByRole('heading', { name: 'Dashboard' });
```

---

## `getByLabel()`

Useful for form fields:

```typescript
page.getByLabel('Username').fill('Edwin');
```

```typescript
page.getByLabel('Password').fill('123456');
```

---

## `getByText()`

Find visible text:

```typescript
page.getByText('Welcome');
```

With exact matching:

```typescript
page.getByText('Welcome', { exact: true });
```

---

## `getByPlaceholder()`

```typescript
page.getByPlaceholder('Enter username');
```

---

## `getByTestId()`

If the application provides stable test IDs:

```typescript
page.getByTestId('login-button');
```

HTML:

```html
<button data-testid="login-button">
  Login
</button>
```

This can be a very stable locator strategy.

---

## CSS selectors

You can use CSS:

```typescript
page.locator('#username');
```

```typescript
page.locator('.login-button');
```

```typescript
page.locator('input[name="username"]');
```

Prefer semantic locators when possible.

---

## XPath

Playwright supports XPath:

```typescript
page.locator('//button[@type="submit"]');
```

However, XPath is generally less preferable than Playwright's semantic locators because it can become fragile when the DOM changes.

---

# 11. Locator chaining

You can combine locators.

```typescript
const form = page.locator('#login-form');

await form.getByLabel('Username').fill('Edwin');
await form.getByLabel('Password').fill('123456');
```

---

# 12. `locator()` and filtering

Example:

```typescript
const rows = page.locator('tr');
```

Find a row containing specific text:

```typescript
const row = page.locator('tr').filter({
  hasText: 'Edwin Mejia',
});
```

Then interact with an element inside it:

```typescript
await row.getByRole('button', { name: 'Edit' }).click();
```

---

# 13. Clicking

Basic:

```typescript
await page.getByRole('button', { name: 'Login' }).click();
```

Force click:

```typescript
await page.getByRole('button', { name: 'Login' }).click({
  force: true,
});
```

Double click:

```typescript
await page.getByText('Item').dblclick();
```

Right click:

```typescript
await page.getByText('Item').click({
  button: 'right',
});
```

---

# 14. Filling input fields

Recommended:

```typescript
await page.getByLabel('Username').fill('Edwin');
```

Clear an input:

```typescript
await page.getByLabel('Username').clear();
```

Type text character by character:

```typescript
await page.getByLabel('Username').pressSequentially('Edwin');
```

For most automation, `fill()` is preferred because it is simpler and faster.

---

# 15. Keyboard actions

Press a key:

```typescript
await page.keyboard.press('Enter');
```

Or:

```typescript
await page.getByLabel('Search').press('Enter');
```

Examples:

```typescript
await page.keyboard.press('Escape');

await page.keyboard.press('Tab');

await page.keyboard.press('Control+A');

await page.keyboard.press('Control+C');

await page.keyboard.press('Control+V');
```

---

# 16. Checkboxes

Check:

```typescript
await page.getByLabel('Remember me').check();
```

Uncheck:

```typescript
await page.getByLabel('Remember me').uncheck();
```

Verify:

```typescript
await expect(
  page.getByLabel('Remember me')
).toBeChecked();
```

---

# 17. Radio buttons

```typescript
await page.getByLabel('Male').check();
```

Verify:

```typescript
await expect(
  page.getByLabel('Male')
).toBeChecked();
```

---

# 18. Select / dropdown

For a native `<select>`:

```typescript
await page.getByLabel('Country').selectOption('CO');
```

By label:

```typescript
await page.getByLabel('Country').selectOption({
  label: 'Colombia',
});
```

By value:

```typescript
await page.getByLabel('Country').selectOption({
  value: 'CO',
});
```

---

# 19. Hover

```typescript
await page.getByText('Products').hover();
```

Useful for menus that appear after hovering.

---

# 20. Drag and drop

```typescript
await page
  .getByTestId('source')
  .dragTo(page.getByTestId('target'));
```

---

# 21. Upload files

```typescript
await page
  .getByLabel('Upload file')
  .setInputFiles('files/document.pdf');
```

Multiple files:

```typescript
await page
  .getByLabel('Upload files')
  .setInputFiles([
    'files/file1.pdf',
    'files/file2.pdf',
  ]);
```

---

# 22. Downloads

Example:

```typescript
const downloadPromise = page.waitForEvent('download');

await page.getByRole('button', { name: 'Download' }).click();

const download = await downloadPromise;

await download.saveAs('downloads/report.pdf');
```

---

# 23. Screenshots

Full page:

```typescript
await page.screenshot({
  path: 'screenshots/home.png',
  fullPage: true,
});
```

Element screenshot:

```typescript
await page
  .getByRole('button', { name: 'Login' })
  .screenshot({
    path: 'screenshots/login-button.png',
  });
```

---

# 24. Navigation

Navigate:

```typescript
await page.goto('https://example.com');
```

With `baseURL` configured:

```typescript
await page.goto('/login');
```

Reload:

```typescript
await page.reload();
```

Go back:

```typescript
await page.goBack();
```

Go forward:

```typescript
await page.goForward();
```

---

# 25. URL assertions

```typescript
await expect(page).toHaveURL(/dashboard/);
```

Exact URL:

```typescript
await expect(page).toHaveURL('https://example.com/dashboard');
```

---

# 26. Page title assertions

```typescript
await expect(page).toHaveTitle('Dashboard');
```

Regex:

```typescript
await expect(page).toHaveTitle(/Dashboard/);
```

---

# 27. Assertions

Assertions are normally written with:

```typescript
expect()
```

The most common assertions are:

```typescript
toBeVisible()
toBeHidden()
toBeEnabled()
toBeDisabled()
toBeChecked()
toHaveText()
toContainText()
toHaveValue()
toHaveAttribute()
toHaveClass()
toHaveCount()
toHaveURL()
toHaveTitle()
```

---

# 28. Visibility assertions

```typescript
await expect(
  page.getByText('Welcome')
).toBeVisible();
```

Hidden:

```typescript
await expect(
  page.getByText('Loading')
).toBeHidden();
```

---

# 29. Enabled / disabled

```typescript
await expect(
  page.getByRole('button', { name: 'Submit' })
).toBeEnabled();
```

```typescript
await expect(
  page.getByRole('button', { name: 'Submit' })
).toBeDisabled();
```

---

# 30. Text assertions

Exact text:

```typescript
await expect(
  page.getByTestId('message')
).toHaveText('Booking created');
```

Partial text:

```typescript
await expect(
  page.getByTestId('message')
).toContainText('Booking');
```

Multiple elements:

```typescript
await expect(
  page.locator('.item')
).toHaveText([
  'Item 1',
  'Item 2',
  'Item 3',
]);
```

---

# 31. Input value assertions

```typescript
await expect(
  page.getByLabel('Username')
).toHaveValue('Edwin');
```

---

# 32. Attribute assertions

```typescript
await expect(
  page.getByRole('button', { name: 'Login' })
).toHaveAttribute('type', 'submit');
```

---

# 33. Count assertions

```typescript
await expect(
  page.locator('.passenger')
).toHaveCount(3);
```

---

# 34. Soft assertions

A normal assertion can stop the test when it fails:

```typescript
await expect(page.getByText('Welcome')).toBeVisible();
```

A soft assertion records the failure but allows the test to continue:

```typescript
await expect.soft(
  page.getByText('Welcome')
).toBeVisible();
```

Useful when you want to validate several independent conditions in one test.

---

# 35. Assertion timeout

```typescript
await expect(
  page.getByText('Booking created')
).toBeVisible({
  timeout: 10_000,
});
```

This is preferable to using arbitrary `waitForTimeout()` calls.

---

# 36. Avoid unnecessary waits

Avoid:

```typescript
await page.waitForTimeout(5000);
```

Prefer:

```typescript
await expect(
  page.getByText('Booking created')
).toBeVisible();
```

Or:

```typescript
await page.waitForLoadState('networkidle');
```

when that specific load-state synchronization is appropriate.

Playwright automatically waits for many actions and assertions to become actionable.

---

# 37. Waiting for API responses

Useful for applications that communicate with backend APIs.

```typescript
const responsePromise = page.waitForResponse(
  response =>
    response.url().includes('/api/bookings') &&
    response.request().method() === 'POST'
);

await page.getByRole('button', { name: 'Create Booking' }).click();

const response = await responsePromise;

expect(response.status()).toBe(201);
```

---

# 38. Waiting for requests

```typescript
const requestPromise = page.waitForRequest(
  request => request.url().includes('/api/bookings')
);

await page.getByRole('button', { name: 'Create Booking' }).click();

const request = await requestPromise;

console.log(request.method());
console.log(request.url());
```

---

# 39. API testing with `request`

Playwright can test APIs without opening a browser.

Example:

```typescript
import { test, expect } from '@playwright/test';

test('API health check', async ({ request }) => {
  const response = await request.get(
    'https://restful-booker.herokuapp.com/ping'
  );

  expect(response.status()).toBe(201);
});
```

---

# 40. GET request

```typescript
const response = await request.get('/api/bookings');

expect(response.ok()).toBeTruthy();
expect(response.status()).toBe(200);
```

Read JSON:

```typescript
const body = await response.json();

console.log(body);
```

---

# 41. POST request

```typescript
const response = await request.post('/api/bookings', {
  data: {
    firstname: 'Edwin',
    lastname: 'Mejia',
    totalprice: 100,
    depositpaid: true,
  },
});

expect(response.status()).toBe(201);
```

---

# 42. PUT request

```typescript
const response = await request.put('/api/bookings/123', {
  data: {
    firstname: 'Edwin',
    lastname: 'Mejia',
  },
});

expect(response.status()).toBe(200);
```

---

# 43. PATCH request

```typescript
const response = await request.patch('/api/bookings/123', {
  data: {
    firstname: 'Edwin',
  },
});

expect(response.status()).toBe(200);
```

---

# 44. DELETE request

```typescript
const response = await request.delete('/api/bookings/123');

expect(response.status()).toBe(201);
```

Always confirm the expected status code against the API contract; status codes vary by API.

---

# 45. Validate API JSON

```typescript
const response = await request.get('/api/booking/123');

const body = await response.json();

expect(body.firstname).toBe('Edwin');
expect(body.lastname).toBe('Mejia');
expect(body.totalprice).toBe(100);
```

Nested property:

```typescript
expect(body.booking.firstname).toBe('Edwin');
```

---

# 46. Headers

Send headers:

```typescript
const response = await request.get('/api/bookings', {
  headers: {
    Authorization: 'Bearer TOKEN',
    Accept: 'application/json',
  },
});
```

Validate headers:

```typescript
expect(
  response.headers()['content-type']
).toContain('application/json');
```

---

# 47. API response status

Common pattern:

```typescript
expect(response.status()).toBe(200);
```

Or:

```typescript
expect(response.ok()).toBeTruthy();
```

For negative tests:

```typescript
expect(response.status()).toBe(400);
```

---

# 48. Test organization with `test.describe`

```typescript
test.describe('Booking API', () => {

  test('Create booking', async ({ request }) => {
    // ...
  });

  test('Get booking', async ({ request }) => {
    // ...
  });

});
```

---

# 49. Hooks

## `beforeEach`

Runs before each test:

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
});
```

## `afterEach`

```typescript
test.afterEach(async ({ page }) => {
  await page.close();
});
```

Usually you do not need to manually close Playwright's built-in `page` fixture.

---

## `beforeAll`

Runs once before all tests in the describe block:

```typescript
test.beforeAll(async () => {
  console.log('Starting test suite');
});
```

---

## `afterAll`

```typescript
test.afterAll(async () => {
  console.log('Finished test suite');
});
```

---

# 50. Test annotations

## Skip a test

```typescript
test.skip('not implemented yet', async ({ page }) => {
  // ...
});
```

Conditional skip:

```typescript
test.skip(
  process.env.ENV === 'production',
  'Not allowed in production'
);
```

---

## Expected failure

```typescript
test.fail('known bug', async ({ page }) => {
  // ...
});
```

This is useful when a test is expected to fail because of a known issue.

---

## Fixme

```typescript
test.fixme('temporarily disabled', async ({ page }) => {
  // ...
});
```

---

## Slow test

```typescript
test.slow('large report generation', async ({ page }) => {
  // ...
});
```

---

# 51. Retries

Run tests with retries from the command line:

```bash
npx playwright test --retries=2
```

Configure globally:

```typescript
retries: 2,
```

Use retries carefully. A test that only passes after retries may indicate a flaky test.

---

# 52. Repeat tests

Run a test multiple times:

```bash
npx playwright test --repeat-each=5
```

Useful for detecting intermittent failures.

---

# 53. Run only failed tests

After a test run:

```bash
npx playwright test --last-failed
```

Very useful during debugging.

---

# 54. Grep and grep-invert

Run tests containing a name:

```bash
npx playwright test --grep "login"
```

Exclude tests:

```bash
npx playwright test --grep-invert "slow"
```

Combine them:

```bash
npx playwright test --grep "booking" --grep-invert "negative"
```

---

# 55. List tests without running them

```bash
npx playwright test --list
```

Useful for verifying which tests Playwright discovers.

---

# 56. Reporter options

List reporter:

```bash
npx playwright test --reporter=list
```

HTML reporter:

```bash
npx playwright test --reporter=html
```

Dot reporter:

```bash
npx playwright test --reporter=dot
```

Common configuration:

```typescript
reporter: 'html',
```

---

# 57. Open the HTML report

After running tests:

```bash
npx playwright show-report
```

You can usually access it through the local browser page opened by Playwright.

---

# 58. Traces

Tracing is extremely useful for debugging failures.

Configuration:

```typescript
use: {
  trace: 'on-first-retry',
},
```

Other useful values include:

```typescript
trace: 'off'
trace: 'on'
trace: 'on-first-retry'
trace: 'retain-on-failure'
```

---

# 59. Screenshots on failure

Configuration:

```typescript
use: {
  screenshot: 'only-on-failure',
},
```

Options include:

```text
off
on
only-on-failure
```

---

# 60. Video recording

```typescript
use: {
  video: 'retain-on-failure',
},
```

This can be very useful in CI environments.

---

# 61. Browser context

A browser context represents an isolated browser session.

Example:

```typescript
test('multiple sessions', async ({ browser }) => {
  const context = await browser.newContext();

  const page = await context.newPage();

  await page.goto('https://example.com');

  await context.close();
});
```

Different contexts can simulate different users.

---

# 62. Multiple pages / tabs

Open a new page:

```typescript
const newPage = await context.newPage();

await newPage.goto('https://example.com');
```

Wait for a new tab:

```typescript
const pagePromise = context.waitForEvent('page');

await page.getByText('Open new tab').click();

const newPage = await pagePromise;

await newPage.waitForLoadState();
```

---

# 63. Popups

```typescript
const popupPromise = page.waitForEvent('popup');

await page.getByRole('button', { name: 'Open' }).click();

const popup = await popupPromise;
```

---

# 64. Dialogs

Handle alert:

```typescript
page.on('dialog', async dialog => {
  await dialog.accept();
});
```

Dismiss:

```typescript
page.on('dialog', async dialog => {
  await dialog.dismiss();
});
```

Read the message:

```typescript
page.on('dialog', async dialog => {
  console.log(dialog.message());
  await dialog.accept();
});
```

---

# 65. Frames / iframes

Locate an iframe:

```typescript
const frame = page.frameLocator('#payment-frame');
```

Interact with it:

```typescript
await frame.getByLabel('Card number').fill('4111111111111111');
```

---

# 66. Cookies

Read cookies:

```typescript
const cookies = await page.context().cookies();

console.log(cookies);
```

Add cookies:

```typescript
await page.context().addCookies([
  {
    name: 'session',
    value: 'abc123',
    domain: 'example.com',
    path: '/',
  },
]);
```

---

# 67. Local storage

```typescript
await page.evaluate(() => {
  localStorage.setItem('token', 'abc123');
});
```

Read:

```typescript
const token = await page.evaluate(() => {
  return localStorage.getItem('token');
});
```

---

# 68. Environment variables

Create a `.env` file if your project uses a dotenv solution:

```text
BASE_URL=https://example.com
USERNAME=testuser
PASSWORD=secret
```

Then access environment variables:

```typescript
process.env.BASE_URL
```

Example configuration:

```typescript
use: {
  baseURL: process.env.BASE_URL,
},
```

Do not commit secrets to Git.

Add sensitive files to `.gitignore`:

```text
.env
.env.*
```

---

# 69. TypeScript types

Playwright provides TypeScript types automatically.

Example:

```typescript
import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.getByLabel('Username').fill('Edwin');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();
}
```

---

# 70. Helper functions

Reusable functions should normally be separated from test files.

Example structure:

```text
tests/
│
├── login.spec.ts
├── booking.spec.ts
│
helpers/
│
├── booking.ts
└── login.ts
```

Example helper:

```typescript
export function generateBooking() {
  return {
    firstname: 'Edwin',
    lastname: 'Mejia',
    totalprice: 100,
    depositpaid: true,
  };
}
```

Import it:

```typescript
import { generateBooking } from '../helpers/booking';
```

Use it:

```typescript
const booking = generateBooking();
```

This approach is especially useful when you have several reusable data generators.

---

# 71. Random test data

Example:

```typescript
export function randomString(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
```

Use it:

```typescript
const firstname = randomString();
```

For more robust test-data generation, consider using a dedicated data-generation library.

---

# 72. Fixtures

Fixtures allow reusable test setup.

Example:

```typescript
import {
  test as base,
  expect,
} from '@playwright/test';

type TestFixtures = {
  username: string;
};

export const test = base.extend<TestFixtures>({
  username: async ({}, use) => {
    await use('Edwin');
  },
});

export { expect };
```

Then:

```typescript
test('example', async ({ username }) => {
  console.log(username);
});
```

Fixtures become particularly valuable in larger automation projects.

---

# 73. Authentication state

Instead of logging in before every test, Playwright can save authentication state.

Example:

```typescript
await page.context().storageState({
  path: 'playwright/.auth/user.json',
});
```

Then configure:

```typescript
use: {
  storageState: 'playwright/.auth/user.json',
},
```

This can significantly reduce test execution time.

Never commit authentication state containing real credentials or sensitive sessions.

---

# 74. Test tags

You can use annotations in test titles:

```typescript
test('@smoke login works', async ({ page }) => {
  // ...
});
```

Run smoke tests:

```bash
npx playwright test --grep "@smoke"
```

Example:

```typescript
test('@regression create booking', async ({ page }) => {
  // ...
});
```

---

# 75. Projects

Projects allow different configurations in the same test suite.

Example:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  {
    name: 'firefox',
    use: { ...devices['Desktop Firefox'] },
  },
],
```

You can then run:

```bash
npx playwright test --project=chromium
```

---

# 76. Mobile testing

Use predefined devices:

```typescript
import { devices } from '@playwright/test';

projects: [
  {
    name: 'Mobile Chrome',
    use: {
      ...devices['Pixel 5'],
    },
  },
]
```

Run:

```bash
npx playwright test --project="Mobile Chrome"
```

---

# 77. Common CLI command cheat sheet

| Command | Purpose |
|---|---|
| `npm init playwright@latest` | Create a Playwright project |
| `npx playwright install` | Install browsers |
| `npx playwright test` | Run all tests |
| `npx playwright test tests/login.spec.ts` | Run one file |
| `npx playwright test --headed` | Show browser |
| `npx playwright test --debug` | Debug |
| `npx playwright test --ui` | Open UI mode |
| `npx playwright test --project=chromium` | Run one project |
| `npx playwright test --grep "login"` | Run matching tests |
| `npx playwright test --grep-invert "slow"` | Exclude matching tests |
| `npx playwright test --last-failed` | Run last failed tests |
| `npx playwright test --repeat-each=5` | Repeat each test |
| `npx playwright test --retries=2` | Retry failures |
| `npx playwright test --workers=1` | Control parallel workers |
| `npx playwright test --list` | List discovered tests |
| `npx playwright test --reporter=html` | Use HTML reporter |
| `npx playwright show-report` | Open HTML report |
| `npx playwright codegen URL` | Generate test code |

---

# 78. Typical daily workflow

A practical workflow for a QA automation project can look like this:

## Step 1 — Install dependencies

```bash
npm install
```

If browsers are missing:

```bash
npx playwright install
```

## Step 2 — Run all tests

```bash
npx playwright test
```

## Step 3 — Investigate failures

```bash
npx playwright test --last-failed --headed
```

Or:

```bash
npx playwright test --debug
```

## Step 4 — Run one test

```bash
npx playwright test tests/booking.spec.ts
```

## Step 5 — Run a specific test

```bash
npx playwright test --grep "Create booking"
```

## Step 6 — Generate the report

```bash
npx playwright test --reporter=html
```

## Step 7 — Open the report

```bash
npx playwright show-report
```

---

# 79. Recommended test structure

A scalable project could look like:

```text
playwright-project/
│
├── tests/
│   ├── ui/
│   │   ├── login.spec.ts
│   │   └── booking.spec.ts
│   │
│   └── api/
│       ├── booking-api.spec.ts
│       └── health-api.spec.ts
│
├── helpers/
│   ├── booking.ts
│   ├── passenger.ts
│   └── random.ts
│
├── fixtures/
│   └── test.ts
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── .gitignore
```

---

# 80. Example complete UI test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login', () => {

  test('user can log in', async ({ page }) => {

    await page.goto('/login');

    await page
      .getByLabel('Username')
      .fill('testuser');

    await page
      .getByLabel('Password')
      .fill('password');

    await page
      .getByRole('button', { name: 'Login' })
      .click();

    await expect(page)
      .toHaveURL(/dashboard/);

    await expect(
      page.getByRole('heading', {
        name: 'Dashboard',
      })
    ).toBeVisible();

  });

});
```

---

# 81. Example complete API test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Booking API', () => {

  test('Create booking', async ({ request }) => {

    const payload = {
      firstname: 'Edwin',
      lastname: 'Mejia',
      totalprice: 100,
      depositpaid: true,
    };

    const response = await request.post(
      'https://example.com/api/bookings',
      {
        data: payload,
      }
    );

    expect(response.status()).toBe(201);

    const body = await response.json();

    expect(body.firstname).toBe(payload.firstname);
    expect(body.lastname).toBe(payload.lastname);

  });

});
```

---

# 82. Good practices

## Prefer semantic locators

Prefer:

```typescript
page.getByRole('button', { name: 'Login' })
```

over:

```typescript
page.locator('button.btn.btn-primary')
```

---

## Avoid arbitrary waits

Avoid:

```typescript
await page.waitForTimeout(5000);
```

Prefer:

```typescript
await expect(page.getByText('Completed')).toBeVisible();
```

---

## Keep tests independent

A test should ideally be capable of running independently.

Avoid:

```text
Test 1 creates booking
        ↓
Test 2 depends on Test 1
        ↓
Test 3 depends on Test 2
```

Prefer each test to create or obtain the data it needs.

---

## Use reusable helpers

If the same operation appears repeatedly:

```typescript
await login(page);
```

instead of duplicating:

```typescript
await page.getByLabel('Username').fill(...);
await page.getByLabel('Password').fill(...);
await page.getByRole('button', { name: 'Login' }).click();
```

---

## Keep test data separate

For complex projects:

```text
helpers/
data/
fixtures/
tests/
```

This makes maintenance easier.

---

# 83. Common mistakes

## Mistake 1 — Using `waitForTimeout()` everywhere

Bad:

```typescript
await page.waitForTimeout(3000);
```

Better:

```typescript
await expect(
  page.getByText('Booking created')
).toBeVisible();
```

---

## Mistake 2 — Overusing XPath

Bad:

```typescript
page.locator(
  '//div/div[2]/div[3]/button'
);
```

Better:

```typescript
page.getByRole('button', {
  name: 'Submit',
});
```

---

## Mistake 3 — Hard-coding changing data

Bad:

```typescript
const booking = {
  firstname: 'Edwin',
  lastname: 'Mejia',
};
```

when every test requires unique data.

Better:

```typescript
const booking = generateBooking();
```

---

## Mistake 4 — Ignoring TypeScript types

Avoid unnecessary `any`:

```typescript
const data: any = ...
```

Prefer a defined interface:

```typescript
interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
}
```

---

# 84. Useful TypeScript pattern for API test data

```typescript
interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
}

export function generateBooking(): Booking {
  return {
    firstname: 'Edwin',
    lastname: 'Mejia',
    totalprice: Math.floor(Math.random() * 500),
    depositpaid: true,
  };
}
```

Then:

```typescript
import { generateBooking } from '../helpers/booking';

const booking = generateBooking();

const response = await request.post('/api/bookings', {
  data: booking,
});
```

This is a clean pattern for reusable API test data.

---

# 85. Environment-specific execution

You can use environment variables:

```bash
$env:BASE_URL="https://qa.example.com"
npx playwright test
```

On Linux/macOS:

```bash
BASE_URL=https://qa.example.com npx playwright test
```

Then:

```typescript
use: {
  baseURL: process.env.BASE_URL,
},
```

For Windows PowerShell:

```powershell
$env:BASE_URL="https://qa.example.com"
npx playwright test
```

---

# 86. CI execution

A typical CI command:

```bash
npx playwright install --with-deps
npx playwright test
```

For a CI environment you may configure:

```typescript
retries: 2,
workers: 1,
reporter: 'html',
```

and:

```typescript
trace: 'on-first-retry',
screenshot: 'only-on-failure',
video: 'retain-on-failure',
```

This provides useful evidence when a test fails remotely.

---

# 87. A recommended command sequence for a new project

```bash
# 1. Create project
npm init playwright@latest

# 2. Install dependencies
npm install

# 3. Install browsers
npx playwright install

# 4. Run all tests
npx playwright test

# 5. Run visibly
npx playwright test --headed

# 6. Debug
npx playwright test --debug

# 7. Interactive UI
npx playwright test --ui

# 8. Run one file
npx playwright test tests/example.spec.ts

# 9. Run one test
npx playwright test --grep "my test"

# 10. Run only Chromium
npx playwright test --project=chromium

# 11. Run failed tests again
npx playwright test --last-failed

# 12. Generate HTML report
npx playwright test --reporter=html

# 13. Open report
npx playwright show-report
```

---

# 88. Quick mental model

When writing Playwright tests, think about the framework in these layers:

```text
                    PLAYWRIGHT
                         │
          ┌──────────────┴──────────────┐
          │                             │
       Browser                         API
          │                             │
       Context                       request
          │                             │
         Page                       Response
          │
       Locators
          │
       Actions
          │
      Assertions
```

### Browser

```typescript
browser
```

Represents the browser process.

### Context

```typescript
context
```

Represents an isolated browser session.

### Page

```typescript
page
```

Represents a tab/page.

### Locator

```typescript
page.getByRole(...)
```

Represents an element or group of elements.

### Action

```typescript
click()
fill()
check()
selectOption()
hover()
```

### Assertion

```typescript
expect(...)
```

Validates the expected result.

### API

```typescript
request.get()
request.post()
request.put()
request.patch()
request.delete()
```

Allows direct API testing.

---

# 89. Most important commands to memorize first

If you are learning Playwright, do not try to memorize everything at once.

Start with these:

## Project

```bash
npm init playwright@latest
npx playwright install
```

## Execution

```bash
npx playwright test
npx playwright test --headed
npx playwright test --debug
npx playwright test --ui
npx playwright test --grep "name"
npx playwright test --project=chromium
npx playwright test --last-failed
```

## Navigation

```typescript
page.goto()
page.reload()
page.goBack()
page.goForward()
```

## Locators

```typescript
page.getByRole()
page.getByLabel()
page.getByText()
page.getByPlaceholder()
page.getByTestId()
page.locator()
```

## Actions

```typescript
click()
fill()
clear()
check()
uncheck()
selectOption()
hover()
press()
```

## Assertions

```typescript
expect(locator).toBeVisible()
expect(locator).toBeHidden()
expect(locator).toHaveText()
expect(locator).toContainText()
expect(locator).toHaveValue()
expect(locator).toBeEnabled()
expect(locator).toBeDisabled()
expect(locator).toBeChecked()
expect(locator).toHaveCount()
expect(page).toHaveURL()
expect(page).toHaveTitle()
```

## API

```typescript
request.get()
request.post()
request.put()
request.patch()
request.delete()
response.status()
response.ok()
response.json()
response.headers()
```

---

# 90. Recommended learning order

For someone learning Playwright with TypeScript, a good progression is:

```text
1. TypeScript basics
        ↓
2. Playwright project structure
        ↓
3. test() and expect()
        ↓
4. page and locators
        ↓
5. Actions
        ↓
6. Assertions
        ↓
7. Hooks
        ↓
8. Test data and helpers
        ↓
9. API testing
        ↓
10. Fixtures
        ↓
11. Authentication
        ↓
12. Projects / browsers
        ↓
13. Debugging and traces
        ↓
14. CI/CD
        ↓
15. Advanced architecture
```

The most important principle is:

> **Write tests that model user behavior, use stable locators, rely on Playwright's built-in waiting, and make assertions against observable results.**

---

## Official documentation

For the latest commands and API details, use the official Playwright documentation:

https://playwright.dev/docs/intro

API testing:

https://playwright.dev/docs/api-testing

Locators:

https://playwright.dev/docs/locators

Assertions:

https://playwright.dev/docs/test-assertions

Test configuration:

https://playwright.dev/docs/test-configuration

Debugging:

https://playwright.dev/docs/debug

Test generator:

https://playwright.dev/docs/codegen
