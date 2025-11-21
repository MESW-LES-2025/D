import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

test.describe('Tasks', () => {
  // Helper function to sign up and create an organization
  const setupUserWithOrganization = async (page: any) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email().toLowerCase();
    const password = 'Password123';
    const orgName = faker.company.name();

    // Sign up
    await page.goto('/sign-up');
    await page.getByLabel('First name').fill(firstName);
    await page.getByLabel('Last name').fill(lastName);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Create an account' }).click();
    await page.waitForURL('/dashboard');

    // Create organization if needed (check if there's a create org button/dialog)
    const createOrgButton = page.getByRole('button', { name: /create organization/i });
    if (await createOrgButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createOrgButton.click();
      await page.getByLabel('Organization name').fill(orgName);
      await page.getByRole('button', { name: /create/i }).click();
    }

    return { email, password, name: `${firstName} ${lastName}`, orgName };
  };

  test.describe('Page Access and Navigation', () => {
    test('should redirect to sign-in when not authenticated', async ({ page }) => {
      await page.goto('/tasks');
      await page.waitForURL(/\/sign-in/);

      await expect(page).toHaveURL(/\/sign-in/);
    });

    test('should display tasks page when authenticated', async ({ page }) => {
      await setupUserWithOrganization(page);

      await page.goto('/tasks');
      await page.waitForURL('/tasks');

      await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
      await expect(page.getByText('Manage your tasks effectively with our intuitive task tracker.')).toBeVisible();
    });
  });

  test.describe('Table and Board Views', () => {
    test('should display table view by default', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Check that Table tab is selected
      const tableTab = page.getByRole('tab', { name: /table/i });

      await expect(tableTab).toHaveAttribute('data-state', 'active');

      // Data table should be visible
      await expect(page.getByRole('table')).toBeVisible();
    });

    test('should switch to board view when clicked', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Click Board tab
      const boardTab = page.getByRole('tab', { name: /board/i });
      await boardTab.click();

      // Check that Board tab is now selected
      await expect(boardTab).toHaveAttribute('data-state', 'active');

      // Board placeholder should be visible
      await expect(page.getByText('Kanban Board coming soon...')).toBeVisible();
    });

    test('should switch back to table view', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Switch to Board view
      await page.getByRole('tab', { name: /board/i }).click();

      await expect(page.getByText('Kanban Board coming soon...')).toBeVisible();

      // Switch back to Table view
      const tableTab = page.getByRole('tab', { name: /table/i });
      await tableTab.click();

      await expect(tableTab).toHaveAttribute('data-state', 'active');
      await expect(page.getByRole('table')).toBeVisible();
    });
  });

  test.describe('Data Table Features', () => {
    test('should display empty state when no tasks', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Should show "No results" message
      await expect(page.getByText('No results.')).toBeVisible();
    });

    test('should display table headers', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Check for column header buttons (they are buttons inside table header cells)
      const table = page.getByRole('table');

      await expect(table.getByRole('button', { name: 'Title' })).toBeVisible();
      await expect(table.getByRole('button', { name: 'Status' })).toBeVisible();
      await expect(table.getByRole('button', { name: 'Priority' })).toBeVisible();
      await expect(table.getByRole('button', { name: 'Difficulty' })).toBeVisible();
      await expect(table.getByText('Assignees')).toBeVisible();
    });

    test('should have select all checkbox', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Check for select all checkbox in header
      const selectAllCheckbox = page.getByRole('checkbox', { name: 'Select all' });

      await expect(selectAllCheckbox).toBeVisible();
    });

    test('should display pagination controls', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Check for pagination text
      await expect(page.getByText(/0 of 0 row\(s\) selected/i)).toBeVisible();
    });

    test('should display view options button', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Check for view options (columns visibility toggle)
      const viewButton = page.getByRole('button', { name: /view/i });

      await expect(viewButton).toBeVisible();
    });

    test('should open column visibility menu', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      const viewButton = page.getByRole('button', { name: /view/i });
      await viewButton.click();

      // Check that column visibility options appear
      await expect(page.getByText(/toggle columns/i)).toBeVisible();
    });

    test('should display status filter', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Status filter button should be visible
      const statusFilter = page.getByRole('button', { name: /status/i }).first();

      await expect(statusFilter).toBeVisible();
    });

    test('should display priority filter', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Priority filter button should be visible
      const priorityFilter = page.getByRole('button', { name: /priority/i }).first();

      await expect(priorityFilter).toBeVisible();
    });

    test('should have filter input', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Search/filter input should be present
      const filterInput = page.getByPlaceholder(/filter/i);

      await expect(filterInput).toBeVisible();
    });

    test('should allow typing in filter input', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      const filterInput = page.getByPlaceholder('Filter tasks...');
      await filterInput.click();
      await filterInput.pressSequentially('test task');

      await expect(filterInput).toHaveValue('test task');
    });

    test('should display page size selector', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Page size selector (rows per page) is a combobox
      await expect(page.getByText('Rows per page')).toBeVisible();

      const pageSizeSelect = page.getByRole('combobox');

      await expect(pageSizeSelect).toBeVisible();
    });

    test('should change page size', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Click page size selector (it's a combobox)
      const pageSizeSelect = page.getByRole('combobox');
      await pageSizeSelect.click();

      // Check that options appear
      await expect(page.getByRole('option', { name: '10' })).toBeVisible();
      await expect(page.getByRole('option', { name: '20' })).toBeVisible();
      await expect(page.getByRole('option', { name: '25' })).toBeVisible();
      await expect(page.getByRole('option', { name: '30' })).toBeVisible();
      await expect(page.getByRole('option', { name: '40' })).toBeVisible();
      await expect(page.getByRole('option', { name: '50' })).toBeVisible();
    });

    test('should have pagination navigation buttons', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Check for pagination buttons (even if disabled when empty)
      await expect(page.getByRole('button', { name: /first page/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /previous page/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /next page/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /last page/i })).toBeVisible();
    });

    test('pagination buttons should be disabled when no tasks', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // All pagination buttons should be disabled when there are no tasks
      await expect(page.getByRole('button', { name: /first page/i })).toBeDisabled();
      await expect(page.getByRole('button', { name: /previous page/i })).toBeDisabled();
      await expect(page.getByRole('button', { name: /next page/i })).toBeDisabled();
      await expect(page.getByRole('button', { name: /last page/i })).toBeDisabled();
    });
  });

  test.describe('Task Creation and Display', () => {
    test('should create a task from dashboard and display it in tasks table', async ({ page }) => {
      await setupUserWithOrganization(page);

      // Navigate to dashboard
      await page.goto('/dashboard');

      // Click "Add Task" button in header
      await page.getByRole('button', { name: /add task/i }).click();

      // Fill in task details
      const taskName = `Test Task ${faker.string.alphanumeric(6)}`;
      await page.getByLabel('Name').fill(taskName);

      // Select priority (find the combobox associated with the Priority label)
      const priorityLabel = page.getByLabel('Priority');
      // The SelectTrigger is a button with role combobox, next to the label
      const priorityCombobox = await priorityLabel.evaluateHandle((label) => {
        // Find the closest form item container
        const container = label.closest('div');

        // Find the combobox (button[role=combobox]) inside the container
        return container?.querySelector('button[role="combobox"]');
      });

      await priorityCombobox.asElement()?.click();
      await page.getByRole('option', { name: 'High' }).click();

      // Select difficulty (find the combobox associated with the Difficulty label)
      const difficultyLabel = page.getByLabel('Difficulty');
      const difficultyCombobox = await difficultyLabel.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });

      await difficultyCombobox.asElement()?.click();
      await page.getByRole('option', { name: /medium/i }).click();

      // Submit
      await page.getByRole('button', { name: 'Create' }).click();

      // Wait for success message
      await expect(page.getByText(/task created successfully/i)).toBeVisible({ timeout: 5000 });

      // Navigate to tasks page
      await page.goto('/tasks');

      // Verify task appears in table
      await expect(page.getByRole('cell', { name: taskName })).toBeVisible();
      await expect(page.getByRole('cell', { name: 'High' })).toBeVisible();
    });

    test('should display multiple tasks in the table', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/dashboard');

      // Create first task
      const taskName1 = `Task One ${faker.string.alphanumeric(6)}`;
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel('Name').fill(taskName1);
      // Select priority
      const priorityLabel1 = page.getByLabel('Priority');
      const priorityCombobox1 = await priorityLabel1.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await priorityCombobox1.asElement()?.click();
      await page.getByRole('option', { name: 'Low' }).click();
      // Select difficulty
      const difficultyLabel1 = page.getByLabel('Difficulty');
      const difficultyCombobox1 = await difficultyLabel1.evaluateHandle((label) => {
        const container = label.closest('div');
        if (!container) {
          return null;
        }
        return container.querySelector('button[role="combobox"]');
      });
      await difficultyCombobox1.asElement()?.click();
      await page.getByRole('option', { name: /easy/i }).click();
      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText(/task created successfully/i)).toBeVisible({ timeout: 5000 });

      // Create second task
      const taskName2 = `Task Two ${faker.string.alphanumeric(6)}`;
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel('Name').fill(taskName2);
      // Select priority
      const priorityLabel2 = page.getByLabel('Priority');
      const priorityCombobox2 = await priorityLabel2.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await priorityCombobox2.asElement()?.click();
      await page.getByRole('option', { name: 'Urgent' }).click();
      // Select difficulty
      const difficultyLabel2 = page.getByLabel('Difficulty');
      const difficultyCombobox2 = await difficultyLabel2.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await difficultyCombobox2.asElement()?.click();
      await page.getByRole('option', { name: /hard/i }).click();
      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText(/task created successfully/i)).toBeVisible({ timeout: 5000 });

      // Navigate to tasks page
      await page.goto('/tasks');

      // Both tasks should be visible
      await expect(page.getByRole('cell', { name: taskName1 })).toBeVisible();
      await expect(page.getByRole('cell', { name: taskName2 })).toBeVisible();
    });

    test('should update row count when tasks exist', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/dashboard');

      // Create a task
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel('Name').fill(`Row Count Test ${faker.string.alphanumeric(6)}`);
      // Select priority
      const priorityLabel = page.getByLabel('Priority');
      const priorityCombobox = await priorityLabel.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await priorityCombobox.asElement()?.click();
      await page.getByRole('option', { name: 'Low' }).click();
      // Select difficulty
      const difficultyLabel = page.getByLabel('Difficulty');
      const difficultyCombobox = await difficultyLabel.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await difficultyCombobox.asElement()?.click();
      await page.getByRole('option', { name: /easy/i }).click();
      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText(/task created successfully/i)).toBeVisible({ timeout: 5000 });

      await page.goto('/tasks');

      // Should not show "No results"
      await expect(page.getByText('No results.')).toBeHidden();

      // Check that table has at least 1 row
      const rows = page.getByRole('row').filter({ has: page.getByRole('cell') });

      await expect(rows.first()).toBeVisible();
    });
  });

  test.describe('Filter Functionality', () => {
    test('should filter tasks by priority', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/dashboard');

      // Create high priority task
      const highPriorityTask = `High Priority ${faker.string.alphanumeric(6)}`;
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel('Name').fill(highPriorityTask);
      // Select priority
      const priorityLabelHigh = page.getByLabel('Priority');
      const priorityComboboxHigh = await priorityLabelHigh.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await priorityComboboxHigh.asElement()?.click();
      await page.getByRole('option', { name: 'High' }).click();
      // Select difficulty
      const difficultyLabelHigh = page.getByLabel('Difficulty');
      const difficultyComboboxHigh = await difficultyLabelHigh.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await difficultyComboboxHigh.asElement()?.click();
      await page.getByRole('option', { name: /easy/i }).click();
      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText(/task created successfully/i)).toBeVisible({ timeout: 5000 });

      // Create low priority task
      const lowPriorityTask = `Low Priority ${faker.string.alphanumeric(6)}`;
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel('Name').fill(lowPriorityTask);
      // Select priority
      const priorityLabelLow = page.getByLabel('Priority');
      const priorityComboboxLow = await priorityLabelLow.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await priorityComboboxLow.asElement()?.click();
      await page.getByRole('option', { name: 'Low' }).click();
      // Select difficulty
      const difficultyLabelLow = page.getByLabel('Difficulty');
      const difficultyComboboxLow = await difficultyLabelLow.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await difficultyComboboxLow.asElement()?.click();
      await page.getByRole('option', { name: /easy/i }).click();
      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText(/task created successfully/i)).toBeVisible({ timeout: 5000 });

      // Go to tasks page
      await page.goto('/tasks');

      // Both tasks should be visible initially
      await expect(page.getByRole('cell', { name: highPriorityTask })).toBeVisible();
      await expect(page.getByRole('cell', { name: lowPriorityTask })).toBeVisible();

      // Filter by High priority
      const priorityFilter = page.getByRole('button', { name: /priority/i }).first();
      await priorityFilter.click();
      await page.getByRole('option', { name: 'High' }).click();

      // Only high priority task should be visible
      await expect(page.getByRole('cell', { name: highPriorityTask })).toBeVisible();
      await expect(page.getByRole('cell', { name: lowPriorityTask })).toBeHidden();
    });

    test('should filter tasks by status', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/dashboard');

      // Create a task (default status is 'todo')
      const taskName = `Status Filter ${faker.string.alphanumeric(6)}`;
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel('Name').fill(taskName);
      // Select priority
      const priorityLabel = page.getByLabel('Priority');
      const priorityCombobox = await priorityLabel.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await priorityCombobox.asElement()?.click();
      await page.getByRole('option', { name: 'Low' }).click();
      // Select difficulty
      const difficultyLabel = page.getByLabel('Difficulty');
      const difficultyCombobox = await difficultyLabel.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await difficultyCombobox.asElement()?.click();
      await page.getByRole('option', { name: /easy/i }).click();
      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText(/task created successfully/i)).toBeVisible({ timeout: 5000 });

      await page.goto('/tasks');

      // Task should be visible
      await expect(page.getByRole('cell', { name: taskName })).toBeVisible();

      // Filter by Backlog status (task should not appear)
      const statusFilter = page.getByRole('button', { name: /status/i }).first();
      await statusFilter.click();
      await page.getByText('Backlog', { exact: true }).click();

      // Task should not be visible
      await expect(page.getByRole('cell', { name: taskName })).toBeHidden();
    });

    test('should filter tasks using search input', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/dashboard');

      // Create task with unique name
      const uniqueTaskName = `UniqueFilterTest ${faker.string.alphanumeric(8)}`;
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel('Name').fill(uniqueTaskName);
      // Select priority
      const priorityLabel = page.getByLabel('Priority');
      const priorityCombobox = await priorityLabel.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await priorityCombobox.asElement()?.click();
      await page.getByRole('option', { name: 'Low' }).click();
      // Select difficulty
      const difficultyLabel = page.getByLabel('Difficulty');
      const difficultyCombobox = await difficultyLabel.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await difficultyCombobox.asElement()?.click();
      await page.getByRole('option', { name: /easy/i }).click();
      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText(/task created successfully/i)).toBeVisible({ timeout: 5000 });

      await page.goto('/tasks');

      // Task should be visible
      await expect(page.getByRole('cell', { name: uniqueTaskName })).toBeVisible();

      // Use filter input
      const filterInput = page.getByPlaceholder(/filter/i);
      await filterInput.fill('UniqueFilterTest');

      // Task should still be visible
      await expect(page.getByRole('cell', { name: uniqueTaskName })).toBeVisible();

      // Type something that doesn't match
      await filterInput.clear();
      await filterInput.fill('NonExistentTask12345');

      // Task should not be visible
      await expect(page.getByRole('cell', { name: uniqueTaskName })).toBeHidden();
    });
  });

  test.describe('Column Visibility', () => {
    test('should toggle column visibility', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/dashboard');

      // Create a task first
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel('Name').fill(`Column Test ${faker.string.alphanumeric(6)}`);
      // Select priority
      const priorityLabel = page.getByLabel('Priority');
      const priorityCombobox = await priorityLabel.evaluateHandle((label) => {
        const container = label.closest('div');

        return container?.querySelector('button[role="combobox"]');
      });
      await priorityCombobox.asElement()?.click();
      await page.getByRole('option', { name: 'Low' }).click();
      // Select difficulty
      const difficultyLabel = page.getByLabel('Difficulty');
      const difficultyCombobox = await difficultyLabel.evaluateHandle((label) => {
        const container = label.closest('div');
        if (!container) {
          return null;
        }
        return container.querySelector('button[role="combobox"]');
      });
      await difficultyCombobox.asElement()?.click();
      await page.getByRole('option', { name: /easy/i }).click();
      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page.getByText(/task created successfully/i)).toBeVisible({ timeout: 5000 });

      await page.goto('/tasks');

      // Open view menu
      const viewButton = page.getByRole('button', { name: /view/i });
      await viewButton.click();

      // Check if columns are listed
      await expect(page.getByText(/toggle columns/i)).toBeVisible();

      // Find and toggle priority column checkbox (in the popover menu)
      const priorityCheckbox = page.getByRole('menuitemcheckbox', { name: /priority/i });
      await priorityCheckbox.click();

      // Close the menu
      await page.keyboard.press('Escape');

      // Priority column header button should not be visible
      await expect(page.getByRole('button', { name: 'Priority' })).toBeHidden();
    });
  });

  test.describe('Table Interaction', () => {
    test('should open status filter menu', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      const statusFilter = page.getByRole('button', { name: /status/i }).first();
      await statusFilter.click();

      // Should show status options
      await expect(page.getByText('Backlog')).toBeVisible();
      await expect(page.getByText('Todo')).toBeVisible();
      await expect(page.getByText('In Progress')).toBeVisible();
      await expect(page.getByText('Review')).toBeVisible();
      await expect(page.getByText('Done')).toBeVisible();
      await expect(page.getByText('Archived')).toBeVisible();
      await expect(page.getByText('Canceled')).toBeVisible();
    });

    test('should open priority filter menu', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      const priorityFilter = page.getByRole('button', { name: /priority/i }).first();
      await priorityFilter.click();

      // Should show priority options
      await expect(page.getByText('Low')).toBeVisible();
      await expect(page.getByText('Medium')).toBeVisible();
      await expect(page.getByText('High')).toBeVisible();
      await expect(page.getByText('Urgent')).toBeVisible();
    });

    test('should allow clearing filter input', async ({ page }) => {
      await setupUserWithOrganization(page);
      await page.goto('/tasks');

      // Type in filter input
      const filterInput = page.getByPlaceholder('Filter tasks...');
      await filterInput.focus();
      await filterInput.fill('test');

      await expect(filterInput).toHaveValue('test');

      // Clear the input
      await filterInput.clear();

      await expect(filterInput).toHaveValue('');
    });
  });
});
