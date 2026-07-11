// FAFBP-34: System converts onboarding answers into a starter chore schedule
const { test, expect } = require('@playwright/test');

test.describe.serial('Operator builds a starter schedule (FAFBP-34)', () => {
  const parentName = `E2E Scheduling ${Date.now()}`;
  let submissionUrl;

  test.beforeAll(async ({ request }) => {
    const res = await request.post('/intake', {
      form: {
        parentName,
        chores: 'school run, washing up, folding laundry',
        routineTimes: 'mornings before school, straight after dinner',
        fitnessGoal: 'build a bit of strength',
      },
    });
    expect(res.status()).toBe(200);
  });

  test('a fresh submission is due within 24 hours and shown as Pending', async ({ page }) => {
    await page.goto('/admin');
    const row = page.locator('tbody tr', { hasText: parentName });
    await expect(row).toBeVisible();
    await expect(row.getByText('Pending')).toBeVisible();

    const submitted = await row.locator('td').nth(1).innerText();
    const dueBy = await row.locator('td').nth(2).innerText();
    const hours = (new Date(dueBy) - new Date(submitted)) / (1000 * 60 * 60);
    expect(hours).toBeCloseTo(24, 0);

    submissionUrl = await row.getByRole('link', { name: 'View →' }).getAttribute('href');
  });

  test('saving only complete rows marks the submission Scheduled and drops incomplete rows', async ({ page }) => {
    await page.goto(submissionUrl);

    const rows = page.locator('.schedule-row');
    // Row 1: complete
    await rows.nth(0).locator('input[name="chore"]').fill('school run');
    await rows.nth(0).locator('input[name="exercise"]').fill('10 calf raises at the door');
    await rows.nth(0).locator('input[name="timing"]').fill('while putting on shoes');
    // Row 2: left entirely blank
    // Row 3: incomplete (chore + exercise, no timing) — should be dropped
    await rows.nth(2).locator('input[name="chore"]').fill('washing up');
    await rows.nth(2).locator('input[name="exercise"]').fill('calf raises at the sink');

    await page.getByRole('button', { name: 'Save starter schedule' }).click();

    await expect(page.getByText('Schedule saved.')).toBeVisible();
    await expect(page.getByText('Scheduled', { exact: true })).toBeVisible();

    const values = await page.locator('#schedule-rows input').evaluateAll((els) => els.map((e) => e.value));
    expect(values.filter((v) => v !== '')).toEqual([
      'school run',
      '10 calf raises at the door',
      'while putting on shoes',
    ]);
  });

  test('operator dashboard reflects the Scheduled status', async ({ page }) => {
    await page.goto('/admin');
    const row = page.locator('tbody tr', { hasText: parentName });
    await expect(row.getByText('Scheduled')).toBeVisible();
  });

  test('saving with no complete rows reverts the submission to Pending', async ({ page }) => {
    await page.goto(submissionUrl);
    await page.locator('.schedule-row').nth(0).locator('input[name="chore"]').fill('');
    await page.locator('.schedule-row').nth(0).locator('input[name="exercise"]').fill('');
    await page.locator('.schedule-row').nth(0).locator('input[name="timing"]').fill('');

    await page.getByRole('button', { name: 'Save starter schedule' }).click();

    await expect(page.getByText('Pending', { exact: true })).toBeVisible();
  });
});

test.describe('Submission lookup edge cases', () => {
  test('a well-formed but non-existent submission id returns 404', async ({ request }) => {
    const res = await request.get('/admin/submissions/000000000000000000000000');
    expect(res.status()).toBe(404);
  });

  // Known defect (found during manual testing): a malformed id is not caught before
  // being handed to Mongoose, so this currently returns 500 instead of a 404. This
  // test documents actual behavior; flip the expectation to 404 once fixed.
  test('a malformed submission id currently returns 500 (known defect, not yet fixed)', async ({ request }) => {
    const res = await request.get('/admin/submissions/not-a-valid-id');
    expect(res.status()).toBe(500);
  });
});
