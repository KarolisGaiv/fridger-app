import { test, expect } from '@playwright/test';
import { fakeUser } from 'utils/fakeData';

const user = fakeUser()

test.describe.serial("new user journey", () => {
  test('new user registration', async ({ page }) => {
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

  test("create meal plan", async({page}) => {
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
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'e2e meal plan' })).toBeVisible()
  })

  test("create meal", async({page}) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill(user.email);
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.getByRole('link', { name: 'Edit Meal Plan' }).click();
  await page.getByRole('textbox', { name: 'Meal name' }).click();
  await page.getByRole('textbox', { name: 'Meal name' }).fill('test meal');
  await page.getByRole('spinbutton', { name: 'Calories' }).click();
  await page.getByRole('spinbutton', { name: 'Calories' }).fill('123');
  await page.getByLabel('Meal typePlease select').selectOption('breakfast');

  await page.getByLabel('Assign to specific plan').selectOption('2');
  await page.getByRole('button', { name: 'Add meal' }).click();

  await expect(page.getByText('Meal added successfully! Add')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Add Ingredients' }).nth(1)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Go to Dashboard' })).toBeVisible()

  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page.getByText('test mealCalories: 123Not')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'test meal' })).toBeVisible()
  await expect(page.getByText('Not Completed')).toBeVisible()
})

  test("add ingredients to meal", async({page}) => {
    await page.goto('http://localhost:5173/');
    await page.goto('http://localhost:5173/login');
    await page.locator('input[type="email"]').click();
    await page.locator('input[type="email"]').fill(user.email);
    await page.locator('input[type="email"]').press('Tab');
    await page.locator('input[name="password"]').fill(user.password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await page.getByRole('link', { name: 'Edit Meal Plan' }).click();
    await page.getByRole('button', { name: 'Add Ingredients' }).click();
    await expect(page.getByRole('heading', { name: 'Add Ingredients To Meal' })).toBeVisible()
    await expect(page.getByText('Select Meal')).toBeVisible()
    await page.getByLabel('Select Meal').selectOption('test meal');

    await expect(page.getByRole('button', { name: 'Select existing ingredient' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add new ingredient' })).toBeVisible()

    await page.getByRole('button', { name: 'Add new ingredient' }).click();
    
    await expect(page.locator('label').filter({ hasText: 'Add New Ingredient' })).toBeVisible()
    await expect(page.getByText('Quantity')).toBeVisible()

    await page.getByPlaceholder('Add new ingredient').click();
    await page.getByPlaceholder('Add new ingredient').fill('test ingredient');
    await page.getByRole('spinbutton', { name: 'Quantity' }).click();
    await page.getByRole('spinbutton', { name: 'Quantity' }).fill('123');
    await page.getByRole('button', { name: 'Add New Ingredient', exact: true }).click();

    await expect(page.getByText('test ingredient added to \'')).toBeVisible()

    await page.getByRole('button', { name: 'Show Ingredients' }).click();

    await expect(page.locator('div').filter({ hasText: 'test ingredient' }).nth(3)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'test ingredient' })).toBeVisible()
  })
})





