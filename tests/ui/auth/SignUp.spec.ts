import { Buffer } from 'node:buffer';
import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Sign Up', () => {
  test.describe('Form Validation', () => {
    test('should display validation errors for empty form submission', async ({
      page,
    }) => {
      await page.goto('/sign-up');

      // Try to submit without filling any fields
      await page.getByRole('button', { name: 'Create an account' }).click();

      // Check for validation messages (using regex for flexibility)
      await expect(page.getByText(/first name.*required/i)).toBeVisible();
      await expect(page.getByText(/last name.*required/i)).toBeVisible();
    });

    test('should display error when passwords do not match', async ({
      page,
    }) => {
      await page.goto('/sign-up');

      await page.getByLabel('First name').fill('John');
      await page.getByLabel('Last name').fill('Doe');
      await page.getByLabel('Email').fill('john.doe@example.com');
      await page.getByLabel('Password', { exact: true }).fill('password123');
      await page.getByLabel('Confirm Password').fill('differentpassword');

      await page.getByRole('button', { name: 'Create an account' }).click();

      await expect(page.getByText(/password.*match/i)).toBeVisible();
    });

    test('should display error for short password', async ({ page }) => {
      await page.goto('/sign-up');

      await page.getByLabel('First name').fill('John');
      await page.getByLabel('Last name').fill('Doe');
      await page.getByLabel('Email').fill('john.doe@example.com');
      await page.getByLabel('Password', { exact: true }).fill('12345');
      await page.getByLabel('Confirm Password').fill('12345');

      await page.getByRole('button', { name: 'Create an account' }).click();

      await expect(
        page.getByText('Password must be at least 8 characters'),
      ).toBeVisible();
    });
  });

  test.describe('Successful Registration', () => {
    test('should successfully create account and redirect to dashboard', async ({
      page,
    }) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email().toLowerCase();
      const password = 'Password123';

      await page.goto('/sign-up');

      // Verify we're on the sign-up page
      await expect(page).toHaveTitle(/Sign Up/);
      await expect(
        page.getByRole('heading', { name: 'Create your account' }),
      ).toBeVisible();

      // Fill in the form
      await page.getByLabel('First name').fill(firstName);
      await page.getByLabel('Last name').fill(lastName);
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Confirm Password').fill(password);

      // Submit the form
      await page.getByRole('button', { name: 'Create an account' }).click();

      // Wait for navigation and check we're redirected to dashboard
      await page.waitForURL('/dashboard');

      await expect(page).toHaveURL('/dashboard');
      await expect(page).toHaveTitle(/Dashboard/);

      // Verify user information is displayed
      await expect(
        page.getByText(`${firstName} ${lastName}`),
      ).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();
    });

    test('should successfully create account with profile image', async ({
      page,
    }) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email().toLowerCase();
      const password = 'Password123';

      await page.goto('/sign-up');

      // Fill in the form
      await page.getByLabel('First name').fill(firstName);
      await page.getByLabel('Last name').fill(lastName);
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Confirm Password').fill(password);

      // Upload a profile image using file input
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'profile.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64',
        ),
      });

      // Verify image preview is shown
      await expect(page.locator('img[alt="Profile preview"]')).toBeVisible();

      // Submit the form
      await page.getByRole('button', { name: 'Create an account' }).click();

      // Wait for navigation to dashboard
      await page.waitForURL('/dashboard', { timeout: 30000 });

      await expect(page).toHaveURL('/dashboard');

      // Verify user information is displayed
      await expect(
        page.getByText(`${firstName} ${lastName}`),
      ).toBeVisible();
    });
  });

  test.describe('Duplicate Email', () => {
    test('should display error when email is already registered', async ({
      page,
    }) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email().toLowerCase();
      const password = 'Password123';

      // First registration
      await page.goto('/sign-up');
      await page.getByLabel('First name').fill(firstName);
      await page.getByLabel('Last name').fill(lastName);
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Confirm Password').fill(password);
      await page.getByRole('button', { name: 'Create an account' }).click();

      // Wait for successful registration
      await page.waitForURL('/dashboard');

      // Sign out - open user menu and click logout
      await page.getByRole('button', { name: /User menu for/ }).click();
      await page.getByRole('menuitem', { name: 'Log out' }).click();
      await page.waitForURL('/sign-in');

      // Try to register with the same email
      await page.getByRole('link', { name: 'Sign Up' }).click();
      await page.getByLabel('First name').fill(firstName);
      await page.getByLabel('Last name').fill(lastName);
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Confirm Password').fill(password);
      await page.getByRole('button', { name: 'Create an account' }).click();

      // Check for error message (adjust based on actual error message)
      await expect(
        page.getByText(/already exists|already registered|already in use/i),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to sign-in page when clicking sign in link', async ({
      page,
    }) => {
      await page.goto('/sign-up');

      await page.getByRole('link', { name: 'Sign in' }).click();

      await expect(page).toHaveURL('/sign-in');
      await expect(page).toHaveTitle(/Sign In/);
    });

    test('should redirect to dashboard if already authenticated', async ({
      page,
    }) => {
      // Create and sign in a user first
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email().toLowerCase();
      const password = 'Password123';

      await page.goto('/sign-up');
      await page.getByLabel('First name').fill(firstName);
      await page.getByLabel('Last name').fill(lastName);
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password', { exact: true }).fill(password);
      await page.getByLabel('Confirm Password').fill(password);
      await page.getByRole('button', { name: 'Create an account' }).click();

      await page.waitForURL('/dashboard');

      // Try to access sign-up page while authenticated
      await page.goto('/sign-up');

      // Should be redirected back to dashboard
      await expect(page).toHaveURL('/dashboard');
    });
  });
});
