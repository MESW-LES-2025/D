import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Sign In', () => {
  // Helper function to create a test user
  const createTestUser = async (page: any) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email().toLowerCase();
    const password = faker.internet.password({ length: 12 });

    await page.goto('/sign-up');
    await page.getByLabel('First name').fill(firstName);
    await page.getByLabel('Last name').fill(lastName);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Create an account' }).click();
    await page.waitForURL('/dashboard');

    // Sign out
    await page.getByRole('button', { name: 'Logout' }).click();
    await page.waitForURL('/sign-in');

    return { email, password, name: `${firstName} ${lastName}` };
  };

  test.describe('Form Validation', () => {
    test('should display validation errors for empty form submission', async ({
      page,
    }) => {
      await page.goto('/sign-in');

      // Try to submit without filling fields
      await page.getByRole('button', { name: 'Login' }).click();

      // Check for validation messages - looking for the error message specifically
      await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    });

    test('should display error for short password', async ({ page }) => {
      await page.goto('/sign-in');

      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Password').fill('12345');

      await page.getByRole('button', { name: 'Login' }).click();

      await expect(
        page.getByText('Password must be at least 8 characters'),
      ).toBeVisible();
    });
  });

  test.describe('Authentication', () => {
    test('should successfully sign in with valid credentials', async ({
      page,
    }) => {
      const { email, password, name } = await createTestUser(page);

      await page.goto('/sign-in');

      // Verify we're on the sign-in page
      await expect(page).toHaveTitle(/Sign In/);
      await expect(
        page.getByRole('heading', { name: 'Login to your account' }),
      ).toBeVisible();

      // Fill in the form
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);

      // Submit the form
      await page.getByRole('button', { name: 'Login' }).click();

      // Wait for navigation and check we're redirected to dashboard
      await page.waitForURL('/dashboard');

      await expect(page).toHaveURL('/dashboard');
      await expect(page).toHaveTitle(/Dashboard/);

      // Verify user information is displayed
      await expect(page.getByText(name)).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();
    });

    test('should display error for invalid credentials', async ({ page }) => {
      await page.goto('/sign-in');

      await page.getByLabel('Email').fill('nonexistent@example.com');
      await page.getByLabel('Password').fill('wrongpassword123');

      await page.getByRole('button', { name: 'Login' }).click();

      // Check for error toast/message
      await expect(
        page.getByText(/failed|invalid|incorrect|not found/i),
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display error for incorrect password', async ({ page }) => {
      const { email } = await createTestUser(page);

      await page.goto('/sign-in');

      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill('wrongpassword123');

      await page.getByRole('button', { name: 'Login' }).click();

      // Check for error message
      await expect(
        page.getByText(/failed|invalid|incorrect|not found/i),
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Callback URL', () => {
    test('should redirect to callback URL after successful sign in', async ({
      page,
    }) => {
      const { email, password } = await createTestUser(page);

      // Navigate to sign-in with a callback URL
      await page.goto('/sign-in?callbackUrl=/dashboard');

      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Login' }).click();

      // Should redirect to the callback URL
      await page.waitForURL('/dashboard');

      await expect(page).toHaveURL('/dashboard');
    });

    test('should handle protected route redirection', async ({ page }) => {
      // Try to access dashboard without being authenticated
      await page.goto('/dashboard');

      // Should be redirected to sign-in with callback URL
      await expect(page).toHaveURL(/\/sign-in\?callbackUrl=/);

      // Now sign in
      const { email, password } = await createTestUser(page);

      await page.goto('/sign-in?callbackUrl=/dashboard');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Login' }).click();

      // Should be redirected back to dashboard
      await page.waitForURL('/dashboard');

      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to sign-up page when clicking sign up link', async ({
      page,
    }) => {
      await page.goto('/sign-in');

      await page.getByRole('link', { name: 'Sign up' }).click();

      await expect(page).toHaveURL('/sign-up');
      await expect(page).toHaveTitle(/Sign Up/);
    });

    test('should redirect to dashboard if already authenticated', async ({
      page,
    }) => {
      // Create and sign in a user
      const { email, password } = await createTestUser(page);

      await page.goto('/sign-in');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL('/dashboard');

      // Try to access sign-in page while authenticated
      await page.goto('/sign-in');

      // Should be redirected back to dashboard
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session after page reload', async ({ page }) => {
      const { email, password } = await createTestUser(page);

      await page.goto('/sign-in');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL('/dashboard');

      // Reload the page
      await page.reload();

      // Should still be on dashboard (session maintained)
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText(email)).toBeVisible();
    });

    test('should successfully sign out', async ({ page }) => {
      const { email, password } = await createTestUser(page);

      await page.goto('/sign-in');
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Login' }).click();
      await page.waitForURL('/dashboard');

      // Sign out
      await page.getByRole('button', { name: 'Logout' }).click();

      // Should be redirected to sign-in page
      await page.waitForURL('/sign-in');

      await expect(page).toHaveURL('/sign-in');

      // Try to access dashboard again
      await page.goto('/dashboard');

      // Should be redirected to sign-in
      await expect(page).toHaveURL(/\/sign-in/);
    });
  });

  test.describe('Form Input Behavior', () => {
    test('should allow email input to be edited', async ({ page }) => {
      await page.goto('/sign-in');

      const emailInput = page.getByLabel('Email');
      await emailInput.fill('test@example.com');

      await expect(emailInput).toHaveValue('test@example.com');

      await emailInput.clear();
      await emailInput.fill('newemail@example.com');

      await expect(emailInput).toHaveValue('newemail@example.com');
    });

    test('should mask password input', async ({ page }) => {
      await page.goto('/sign-in');

      const passwordInput = page.getByLabel('Password');

      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should preserve form values after validation error', async ({
      page,
    }) => {
      await page.goto('/sign-in');

      const email = 'test@example.com';
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill('short');

      await page.getByRole('button', { name: 'Login' }).click();

      // Email should still be filled after validation error
      await expect(page.getByLabel('Email')).toHaveValue(email);
    });
  });
});
