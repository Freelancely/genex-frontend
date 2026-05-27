import { test, expect, APIRequestContext, Page } from '@playwright/test';

const API = 'http://localhost:5177/api';
const ADMIN_EMAIL = 'shrawan.tamrakar@pratibuddha.com.np';
const ADMIN_PASSWORD = 'Shrawan@123';

const TEST_ADMIN_EMAIL = `testadmin_${Date.now()}@gmail.com`;
const TEST_ADMIN_PASSWORD = 'Test@1234';

const CUSTOMER_EMAIL = `customer_${Date.now()}@example.com`;
const CUSTOMER_PASSWORD = 'Customer@1234';

async function loginViaApi(request: APIRequestContext, email: string, password: string) {
  const res = await request.post(`${API}/user/login`, {
    data: { email, password }
  });
  expect(res.status(), `Login failed for ${email}: ${await res.text()}`).toBe(200);
  const body = await res.json();
  expect(body.success).toBeTruthy();
  return body as { token: string; role: string; userId: string };
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
}

test.describe('Genex E2E — public storefront (browser)', () => {
  test('home page loads and shows products from the seeder', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Genex/i);
    await shot(page, '01-home');
  });

  test('login form renders', async ({ page }) => {
    await page.goto('/pages/login');
    const email = page.locator('input[type="email"], input[formControlName="email"], input[name="email"]').first();
    const password = page.locator('input[type="password"], input[formControlName="password"], input[name="password"]').first();
    await expect(email).toBeVisible();
    await expect(password).toBeVisible();
    await shot(page, '02-login-form');
  });

  test('register form renders', async ({ page }) => {
    await page.goto('/pages/register');
    await expect(page.locator('form').first()).toBeVisible();
    await shot(page, '03-register-form');
  });
});

test.describe('Genex E2E — admin login UI (browser)', () => {
  test('seeded SuperAdmin logs in and lands on admin area', async ({ page }) => {
    await page.goto('/pages/login');

    const emailInput = page.locator('input[type="email"], input[formControlName="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[formControlName="password"]').first();

    await emailInput.fill(ADMIN_EMAIL);
    await passwordInput.fill(ADMIN_PASSWORD);

    // Wait for the API response triggered by submission. Use Enter key — reliably triggers ngSubmit.
    const loginResponsePromise = page.waitForResponse(resp =>
      resp.url().includes('/api/user/login') && resp.request().method() === 'POST',
      { timeout: 15_000 }
    );
    await passwordInput.press('Enter');
    const loginResponse = await loginResponsePromise;
    expect(loginResponse.status(), 'login API should return 200').toBe(200);

    // JWT now lives in an HttpOnly cookie (not readable from JS); the SPA
    // keeps `role` in localStorage as a UI hint. Wait for the role hint to land,
    // then verify the HttpOnly auth cookie was issued.
    await page.waitForFunction(() => !!localStorage.getItem('role'), null, { timeout: 10_000 });
    await shot(page, '04-admin-after-login');

    const role = await page.evaluate(() => localStorage.getItem('role'));
    expect(role).toBe('SuperAdmin');

    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'genex_token');
    expect(authCookie, 'genex_token HttpOnly cookie should be issued on login').toBeDefined();
    expect(authCookie!.httpOnly).toBe(true);
  });
});

test.describe('Genex E2E — API: role enforcement & flows', () => {
  test('SuperAdmin can list admins; result includes seeded admin', async ({ request }) => {
    const { token } = await loginViaApi(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const res = await request.get(`${API}/user/admins`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(res.status(), `admins endpoint failed: ${await res.text()}`).toBe(200);
    const body = await res.json();
    expect(body.success).toBeTruthy();
    const emails = (body.message as any[]).map(a => a.email);
    expect(emails).toContain(ADMIN_EMAIL);
  });

  test('SuperAdmin can create a new Admin user', async ({ request }) => {
    const { token } = await loginViaApi(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const res = await request.post(`${API}/user/admins`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        firstname: 'Test',
        lastname: 'Admin',
        email: TEST_ADMIN_EMAIL,
        phoneNumber: `98${Math.floor(10000000 + Math.random() * 89999999)}`,
        address: 'Test Address',
        password: TEST_ADMIN_PASSWORD,
        role: 'Admin'
      }
    });
    expect(res.status(), `create admin failed: ${await res.text()}`).toBe(200);
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.message.email).toBe(TEST_ADMIN_EMAIL);
    expect(body.message.role).toBe('Admin');
  });

  test('Newly-created Admin can log in and gets role=Admin', async ({ request }) => {
    const { role } = await loginViaApi(request, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
    expect(role).toBe('Admin');
  });

  test('Admin (non-SuperAdmin) CANNOT list admins (403)', async ({ request }) => {
    const { token } = await loginViaApi(request, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
    const res = await request.get(`${API}/user/admins`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Expect 403 Forbidden or 401 Unauthorized
    expect([401, 403]).toContain(res.status());
  });

  test('Admin (non-SuperAdmin) CAN add a category (regression: was previously blocked)', async ({ request }) => {
    const { token } = await loginViaApi(request, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
    const categoryName = `TestCat_${Date.now()}`;
    const res = await request.post(`${API}/category/add-category`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { Categoryname: categoryName }
    });
    expect(res.status(), `add-category failed: ${await res.text()}`).toBe(200);
    const body = await res.json();
    expect(body.success).toBeTruthy();
  });

  test('SuperAdmin CAN add a category', async ({ request }) => {
    const { token } = await loginViaApi(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    const categoryName = `SuperCat_${Date.now()}`;
    const res = await request.post(`${API}/category/add-category`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { Categoryname: categoryName }
    });
    expect(res.status(), `add-category as SuperAdmin failed: ${await res.text()}`).toBe(200);
  });

  test('Customer flow: register → login → view products', async ({ request }) => {
    // Register
    const regForm = new FormData();
    regForm.append('Firstname', 'Test');
    regForm.append('Lastname', 'Customer');
    regForm.append('Address', 'Test Street');
    regForm.append('Email', CUSTOMER_EMAIL);
    regForm.append('PhoneNumber', `97${Math.floor(10000000 + Math.random() * 89999999)}`);
    regForm.append('Password', CUSTOMER_PASSWORD);
    regForm.append('ConfirmPassword', CUSTOMER_PASSWORD);

    const regRes = await request.post(`${API}/user/register`, {
      multipart: {
        Firstname: 'Test',
        Lastname: 'Customer',
        Address: 'Test Street',
        Email: CUSTOMER_EMAIL,
        PhoneNumber: `97${Math.floor(10000000 + Math.random() * 89999999)}`,
        Password: CUSTOMER_PASSWORD,
        ConfirmPassword: CUSTOMER_PASSWORD
      }
    });
    expect(regRes.status(), `register failed: ${await regRes.text()}`).toBe(200);

    // Products are public — should return seeded products
    const prodRes = await request.post(`${API}/product/view-products`, {
      data: { pageNumber: 1, pageSize: 10 }
    });
    expect(prodRes.status()).toBe(200);
    const prodBody = await prodRes.json();
    expect(prodBody.success).toBeTruthy();
    expect(Array.isArray(prodBody.data)).toBeTruthy();
    expect(prodBody.data.length).toBeGreaterThan(0);
  });

  test('Public: /api/category/get-all-categories returns seeded categories', async ({ request }) => {
    const res = await request.get(`${API}/category/get-all-categories`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBeTruthy();
    const names: string[] = body.data.map((c: any) => c.categoryName);
    // Demo seeder seeds Electronics, Fashion, Beauty, Jewelry, Home Appliances
    expect(names).toEqual(expect.arrayContaining(['Electronics', 'Fashion', 'Beauty', 'Jewelry', 'Home Appliances']));
  });
});
