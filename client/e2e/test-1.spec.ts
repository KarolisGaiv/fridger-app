import { test, expect } from '@playwright/test';

test('new user journey', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/login');

  await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible()

  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('test@test.com');
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[name="password"]').fill('Test1234');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByTestId('errorMessage')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible()

  await page.getByRole('link', { name: 'Sign up' }).click();
  await page.locator('div').filter({ hasText: /^First Name$/ }).getByTestId('firstName').click();
  await page.locator('div').filter({ hasText: /^First Name$/ }).getByTestId('firstName').fill('test');
  await page.locator('div').filter({ hasText: /^Last Name$/ }).getByTestId('lastName').fill('t');
  await page.locator('div').filter({ hasText: /^Last Name$/ }).getByTestId('lastName').click();
  await page.locator('div').filter({ hasText: /^Last Name$/ }).getByTestId('lastName').fill('test');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('test@test.com');
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[name="password"]').fill('Testing1234');
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page.getByTestId('successMessage')).toBeVisible()
});

test("login", async({page}) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('test@test.com');
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[name="password"]').fill('Testing1234');
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Add Meal Plan' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  
  await expect(page.getByRole('heading', { name: 'Current Meal Plan Details' })).toBeVisible()
  await expect(page.getByTestId('errorMessage')).toBeVisible()
})