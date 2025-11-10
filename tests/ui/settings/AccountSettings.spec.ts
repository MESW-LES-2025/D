import { Buffer } from 'node:buffer';
import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Account Settings', () => {
  // Helper function to create and sign in a test user
  const signInTestUser = async (page: any) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email().toLowerCase();
    const password = 'Password123';

    // Create account
    await page.goto('/sign-up');
    await page.getByLabel('First name').fill(firstName);
    await page.getByLabel('Last name').fill(lastName);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Create an account' }).click();
    await page.waitForURL('/dashboard');

    // Navigate to account settings
    await page.goto('/settings/account');

    return { email, password, firstName, lastName };
  };

  test.describe('Name Update', () => {
    test('should successfully update name', async ({ page }) => {
      await signInTestUser(page);

      const newFirstName = faker.person.firstName();
      const newLastName = faker.person.lastName();

      // Update name
      await page.getByLabel('First Name').clear();
      await page.getByLabel('First Name').fill(newFirstName);
      await page.getByLabel('Last Name').clear();
      await page.getByLabel('Last Name').fill(newLastName);

      await page.getByRole('button', { name: 'Save' }).click();

      // Check for success message
      await expect(page.getByText(/name updated successfully/i)).toBeVisible({
        timeout: 5000,
      });

      // Verify updated name is displayed
      await expect(page.getByLabel('First Name')).toHaveValue(newFirstName);
      await expect(page.getByLabel('Last Name')).toHaveValue(newLastName);
    });

    test('should display validation error for empty first name', async ({
      page,
    }) => {
      await signInTestUser(page);

      await page.getByLabel('First Name').clear();
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.getByText(/first name is required/i)).toBeVisible();
    });

    test('should display validation error for empty last name', async ({
      page,
    }) => {
      await signInTestUser(page);

      await page.getByLabel('Last Name').clear();
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.getByText(/last name is required/i)).toBeVisible();
    });

    test('should accept names with hyphens and apostrophes', async ({
      page,
    }) => {
      await signInTestUser(page);

      await page.getByLabel('First Name').clear();
      await page.getByLabel('First Name').fill('Mary-Jane');
      await page.getByLabel('Last Name').clear();
      await page.getByLabel('Last Name').fill('O\'Brien');

      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.getByText(/name updated successfully/i)).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe('Password Update', () => {
    test('should successfully update password', async ({ page }) => {
      const { email, password } = await signInTestUser(page);

      const newPassword = 'NewTestPassword456!';

      // Update password
      await page.getByLabel('Current Password').fill(password);
      await page.getByLabel('New Password', { exact: true }).fill(newPassword);
      await page.getByLabel('Confirm New Password').fill(newPassword);

      await page.getByRole('button', { name: 'Update Password' }).click();

      // Check for success message
      await expect(
        page.getByText(/password (updated|changed) successfully/i),
      ).toBeVisible({ timeout: 5000 });

      // Sign out
      await page.goto('/dashboard');
      await page.getByRole('button', { name: 'Logout' }).click();
      await page.waitForURL('/sign-in');

      // Sign in with new password
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(newPassword);
      await page.getByRole('button', { name: 'Login' }).click();

      await page.waitForURL('/dashboard');

      await expect(page).toHaveURL('/dashboard');
    });

    test('should display error for incorrect current password', async ({
      page,
    }) => {
      await signInTestUser(page);

      await page.getByLabel('Current Password').fill('WrongPassword123!');
      await page.getByLabel('New Password', { exact: true }).fill('NewPassword456!');
      await page.getByLabel('Confirm New Password').fill('NewPassword456!');

      await page.getByRole('button', { name: 'Update Password' }).click();

      await expect(
        page.getByText(/Invalid password/i),
      ).toBeVisible({ timeout: 5000 });
    });

    test('should display error when passwords do not match', async ({
      page,
    }) => {
      const { password } = await signInTestUser(page);

      await page.getByLabel('Current Password').fill(password);
      await page.getByLabel('New Password', { exact: true }).fill('NewPassword456!');
      await page.getByLabel('Confirm New Password').fill('DifferentPassword789!');

      await page.getByRole('button', { name: 'Update Password' }).click();

      await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('should display error for weak password', async ({ page }) => {
      const { password } = await signInTestUser(page);

      await page.getByLabel('Current Password').fill(password);
      await page.getByLabel('New Password', { exact: true }).fill('weak');
      await page.getByLabel('Confirm New Password').fill('weak');

      await page.getByRole('button', { name: 'Update Password' }).click();

      await expect(
        page.getByText(/password must be at least 8 characters/i),
      ).toBeVisible();
    });

    test('should display error when new password is same as current', async ({
      page,
    }) => {
      const { password } = await signInTestUser(page);

      await page.getByLabel('Current Password').fill(password);
      await page.getByLabel('New Password', { exact: true }).fill(password);
      await page.getByLabel('Confirm New Password').fill(password);

      await page.getByRole('button', { name: 'Update Password' }).click();

      await expect(
        page.getByText(/new password must be different/i),
      ).toBeVisible();
    });
  });

  test.describe('Avatar Update', () => {
    test('should open avatar upload dialog', async ({ page }) => {
      await signInTestUser(page);

      await page.getByLabel('Edit profile picture').click();

      await expect(
        page.getByRole('heading', { name: 'Update Profile Picture' }),
      ).toBeVisible();
      await expect(page.getByText(/drag and drop/i)).toBeVisible();
    });

    test('should close dialog on cancel', async ({ page }) => {
      await signInTestUser(page);

      await page.getByLabel('Edit profile picture').click();

      // Close dialog by clicking outside or cancel button
      await page.keyboard.press('Escape');

      await expect(
        page.getByRole('heading', { name: 'Update Profile Picture' }),
      ).toBeHidden();
    });

    test('should display validation error for non-image file', async ({
      page,
    }) => {
      await signInTestUser(page);

      await page.getByLabel('Edit profile picture').click();

      // Try to upload a non-image file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content'),
      });

      await expect(
        page.getByText(/file must be a valid image format/i),
      ).toBeVisible();
    });

    test('should display remove button when avatar exists', async ({
      page,
    }) => {
      const { firstName, lastName } = await signInTestUser(page);

      // Check if default avatar (initials) is shown
      const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

      await expect(page.getByText(initials)).toBeVisible();

      await page.getByLabel('Edit profile picture').click();

      // Remove button might be disabled if no avatar uploaded
      const removeButton = page.getByRole('button', { name: /remove/i });

      await expect(removeButton).toBeVisible();
    });
  });

  test.describe('Account Deletion', () => {
    test('should open delete confirmation dialog', async ({ page }) => {
      await signInTestUser(page);

      await page.getByRole('button', { name: 'Delete Account' }).click();

      await expect(
        page.getByRole('heading', { name: 'Delete Account' }),
      ).toBeVisible();
      await expect(
        page.getByText(/This action cannot be undone. This will permanently delete/i),
      ).toBeVisible();
    });

    test('should cancel account deletion', async ({ page }) => {
      await signInTestUser(page);

      await page.getByRole('button', { name: 'Delete Account' }).click();
      await page.getByRole('button', { name: 'Cancel' }).click();

      // Should still be on account settings page
      await expect(page).toHaveURL('/settings/account');
    });

    test('should successfully delete account with correct password', async ({
      page,
    }) => {
      const { email, password } = await signInTestUser(page);

      await page.getByRole('button', { name: 'Delete Account' }).click();

      // Enter password in dialog
      await page.getByLabel('Confirm Password').fill(password);
      await page
        .getByRole('button', { name: 'Delete Account' })
        .last()
        .click();

      // Should be redirected to sign-in page
      await page.waitForURL('/sign-in', { timeout: 10000 });

      await expect(page).toHaveURL('/sign-in');

      // Try to sign in with deleted account
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: 'Login' }).click();

      // Should show error
      await expect(
        page.getByText(/failed|invalid|incorrect|not found/i),
      ).toBeVisible({ timeout: 10000 });
    });

    test('should display error for incorrect password', async ({ page }) => {
      await signInTestUser(page);

      await page.getByRole('button', { name: 'Delete Account' }).click();

      await page.getByLabel('Confirm Password').fill('WrongPassword123!');
      await page
        .getByRole('button', { name: 'Delete Account' })
        .last()
        .click();

      await expect(
        page.getByText(/Invalid password/i),
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Navigation and Access', () => {
    test('should redirect unauthenticated user to sign-in', async ({
      page,
    }) => {
      await page.goto('/settings/account');

      // Should be redirected to sign-in with callback URL
      await expect(page).toHaveURL(/\/sign-in\?callbackUrl=/);
    });

    test('should allow authenticated user to access account settings', async ({
      page,
    }) => {
      await signInTestUser(page);

      await expect(page).toHaveURL('/settings/account');
      await expect(
        page.getByRole('heading', { name: 'Account' }),
      ).toBeVisible();
    });

    test('should display all account sections', async ({ page }) => {
      await signInTestUser(page);

      // Check all sections are visible
      await expect(
        page.getByRole('heading', { level: 3, name: 'Profile Picture' }),
      ).toBeVisible();
      await expect(
        page.locator('div[data-slot="card-title"]', { hasText: 'Name' }),
      ).toBeVisible();
      await expect(
        page.locator('div[data-slot="card-title"]', { hasText: 'Password' }),
      ).toBeVisible();
      await expect(
        page.locator('div[data-slot="card-title"]', { hasText: 'Danger Zone' }),
      ).toBeVisible();
    });

    test('should maintain session after settings update', async ({ page }) => {
      const { email } = await signInTestUser(page);

      // Update name
      const newFirstName = faker.person.firstName();
      await page.getByLabel('First Name').clear();
      await page.getByLabel('First Name').fill(newFirstName);
      await page.getByRole('button', { name: 'Save' }).click();

      await expect(page.getByText(/name updated successfully/i)).toBeVisible({
        timeout: 5000,
      });

      // Navigate to dashboard
      await page.goto('/dashboard');

      // Should still be authenticated
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText(email)).toBeVisible();
    });
  });

  test.describe('Form Behavior', () => {
    test('should show loading state during name update', async ({ page }) => {
      await signInTestUser(page);

      await page.getByLabel('First Name').fill('NewName');
      await page.getByRole('button', { name: 'Save' }).click();

      // Button should show loading state
      await expect(page.getByText(/saving/i)).toBeVisible();
    });

    test('should show loading state during password update', async ({
      page,
    }) => {
      const { password } = await signInTestUser(page);

      await page.getByLabel('Current Password').fill(password);
      await page.getByLabel('New Password', { exact: true }).fill('NewPassword456!');
      await page.getByLabel('Confirm New Password').fill('NewPassword456!');
      await page.getByRole('button', { name: 'Update Password' }).click();

      // Button should show loading state
      await expect(page.getByText(/updating password/i)).toBeVisible();
    });
  });
});
