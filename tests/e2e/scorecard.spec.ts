import { test, expect } from '@playwright/test';

test.describe('Archers Scorecard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000/');
  });

  test('should load the application successfully', async ({ page }) => {
    // Check that the page loads with the correct title
    await expect(page).toHaveTitle(/Archers Scorecard/);
    
    // Check that the main heading is visible
    await expect(page.locator('h1')).toContainText('Archers Scorecard');
    
    // Check that navigation is present
    await expect(page.locator('#nav-scoring')).toBeVisible();
    await expect(page.locator('#nav-history')).toBeVisible();
  });

  test('should display round selection interface', async ({ page }) => {
    // Check that the new session interface is visible
    await expect(page.locator('#scoring-view h2')).toContainText('New Session');
    await expect(page.locator('text=Select a round type to begin')).toBeVisible();
    
    // Check that round type selector is present
    await expect(page.locator('#round-type')).toBeVisible();
    
    // Check that start button is present but disabled
    const startButton = page.locator('#start-session');
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeDisabled();
  });

  test('should populate round type options', async ({ page }) => {
    const roundSelect = page.locator('#round-type');
    
    // Click to open dropdown
    await roundSelect.click();
    
    // Check that options are populated
    await expect(roundSelect.locator('option')).toHaveCount(8); // 1 default + 7 round types
    
    // Check for specific round types
    await expect(roundSelect.locator('option[value="70m-122cm"]')).toContainText('70m Round - 70m');
    await expect(roundSelect.locator('option[value="practice-30m"]')).toContainText('Practice 30m - 30m');
  });

  test('should enable start button when round is selected', async ({ page }) => {
    const roundSelect = page.locator('#round-type');
    const startButton = page.locator('#start-session');
    
    // Initially disabled
    await expect(startButton).toBeDisabled();
    
    // Select a round type
    await roundSelect.selectOption('practice-30m');
    
    // Button should now be enabled
    await expect(startButton).toBeEnabled();
  });

  test('should start a scoring session', async ({ page }) => {
    const roundSelect = page.locator('#round-type');
    const startButton = page.locator('#start-session');
    
    // Select a round type and start session
    await roundSelect.selectOption('practice-30m');
    await startButton.click();
    
    // Check that scoring interface appears
    await expect(page.locator('#scoring-interface')).toBeVisible();
    
    // Check that round selector is hidden
    await expect(page.locator('.round-selector')).toBeHidden();
    
    // Check for scoring elements
    await expect(page.locator('#current-end-number')).toContainText('1');
    await expect(page.locator('#running-total')).toContainText('0');
    await expect(page.locator('#end-total')).toContainText('0');
  });

  test('should allow score input and validation', async ({ page }) => {
    // Start a session
    await page.locator('#round-type').selectOption('practice-30m');
    await page.locator('#start-session').click();
    
    // Get score input fields
    const scoreInputs = page.locator('.score-input');
    
    // Test valid inputs
    await scoreInputs.nth(0).fill('10');
    await scoreInputs.nth(1).fill('X');
    await scoreInputs.nth(2).fill('9');
    
    // Check that end total updates
    await expect(page.locator('#end-total')).toContainText('29');
    
    // Test invalid input - clear first input and try invalid value
    await scoreInputs.nth(0).fill('11');
    await scoreInputs.nth(0).blur();
    
    // Invalid input should be cleared
    await expect(scoreInputs.nth(0)).toHaveValue('');
  });

  test('should complete an end and update totals', async ({ page }) => {
    // Start a session
    await page.locator('#round-type').selectOption('practice-30m');
    await page.locator('#start-session').click();
    
    // Fill all arrow scores
    const scoreInputs = page.locator('.score-input');
    await scoreInputs.nth(0).fill('10');
    await scoreInputs.nth(1).fill('9');
    await scoreInputs.nth(2).fill('8');
    
    // Complete the end
    await page.locator('#complete-end').click();
    
    // Check that running total is updated
    await expect(page.locator('#running-total')).toContainText('27');
    
    // Check that end number increments
    await expect(page.locator('#current-end-number')).toContainText('2');
    
    // Check that inputs are cleared
    await expect(scoreInputs.nth(0)).toHaveValue('');
    await expect(scoreInputs.nth(1)).toHaveValue('');
    await expect(scoreInputs.nth(2)).toHaveValue('');
    
    // Check that end total is reset
    await expect(page.locator('#end-total')).toContainText('0');
  });

  test('should navigate between views', async ({ page }) => {
    // Test navigation to History
    await page.locator('#nav-history').click();
    await expect(page.locator('#history-view')).toHaveClass(/active/);
    await expect(page.locator('#nav-history')).toHaveClass(/active/);
    
    // Test navigation back to Scoring
    await page.locator('#nav-scoring').click();
    await expect(page.locator('#scoring-view')).toHaveClass(/active/);
    await expect(page.locator('#nav-scoring')).toHaveClass(/active/);
  });

  test('should display empty history initially', async ({ page }) => {
    // Navigate to history
    await page.locator('#nav-history').click();
    
    // Check for empty state message
    await expect(page.locator('#session-list')).toContainText('No sessions recorded yet');
  });

  test('should clear current end', async ({ page }) => {
    // Start a session
    await page.locator('#round-type').selectOption('practice-30m');
    await page.locator('#start-session').click();
    
    // Fill some scores
    const scoreInputs = page.locator('.score-input');
    await scoreInputs.nth(0).fill('10');
    await scoreInputs.nth(1).fill('9');
    
    // Check that end total shows the scores
    await expect(page.locator('#end-total')).toContainText('19');
    
    // Clear the end
    await page.locator('#clear-end').click();
    
    // Check that inputs are cleared
    await expect(scoreInputs.nth(0)).toHaveValue('');
    await expect(scoreInputs.nth(1)).toHaveValue('');
    
    // Check that end total is reset
    await expect(page.locator('#end-total')).toContainText('0');
  });

  test('should handle miss scores correctly', async ({ page }) => {
    // Start a session
    await page.locator('#round-type').selectOption('practice-30m');
    await page.locator('#start-session').click();
    
    // Fill with miss scores
    const scoreInputs = page.locator('.score-input');
    await scoreInputs.nth(0).fill('M');
    await scoreInputs.nth(1).fill('M');
    await scoreInputs.nth(2).fill('M');
    
    // Check that end total remains 0
    await expect(page.locator('#end-total')).toContainText('0');
    
    // Complete the end
    await page.locator('#complete-end').click();
    
    // Check that running total remains 0
    await expect(page.locator('#running-total')).toContainText('0');
  });
});
