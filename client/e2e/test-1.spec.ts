import { test, expect } from '@playwright/test';
import { fakeUser } from 'utils/fakeData';

const user = fakeUser()

test('new user journey', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/login');

  await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible()

  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByTestId('errorMessage')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Log in to your account' })).toBeVisible()

  await page.getByRole('link', { name: 'Sign up' }).click();
  await page.locator('div').filter({ hasText: /^First Name$/ }).getByTestId('firstName').click();
  await page.locator('div').filter({ hasText: /^First Name$/ }).getByTestId('firstName').fill(user.firstName);
  await page.locator('div').filter({ hasText: /^Last Name$/ }).getByTestId('lastName').click();
  await page.locator('div').filter({ hasText: /^Last Name$/ }).getByTestId('lastName').fill(user.lastName);
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page.getByTestId('successMessage')).toBeVisible()
});

test("login", async({page}) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Add Meal Plan' }).click();
  await page.getByRole('link', { name: 'Dashboard' }).click();
  
  await expect(page.getByRole('heading', { name: 'Current Meal Plan Details' })).toBeVisible()
  await expect(page.getByTestId('errorMessage')).toBeVisible()
})

test("create meal", async({page}) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Add Meal Plan' }).click();
  
  await expect(page.getByRole('heading', { name: 'Create a new meal plan' })).toBeVisible()
  await page.getByRole('textbox', { name: 'Meal plan name' }).click();
  await page.getByRole('textbox', { name: 'Meal plan name' }).fill('e2e meal plan');
  await expect(page.getByText('Add as active plan')).toBeVisible()
  await page.getByLabel('Add as active plan').check();
  await page.getByRole('button', { name: 'Add meal plan' }).click();
  await expect(page.getByText('Meal plan created')).toBeVisible()
  await expect(page.getByText('Would you like to add new')).toBeVisible()
  
  await expect(page.getByRole('heading', { name: 'e2e meal plan' })).toBeVisible()
})
