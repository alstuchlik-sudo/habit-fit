// FAFBP-33: User answers 3 to 5 questions about household chores, routine times, and fitness goal
// FAFBP-34: System converts onboarding answers into a starter chore schedule
const { test, expect } = require('@playwright/test');

function uniqueName() {
  return `E2E ${Date.now()}`;
}

test.describe('Intake form (FAFBP-33)', () => {
  test('submitting valid answers redirects to the thank-you page', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Your name').fill(uniqueName());
    await page.getByLabel('Household chores you already do').fill('school run, washing up, folding laundry');
    await page.getByLabel('When does your routine usually happen?').fill('mornings before school, straight after dinner');
    await page.getByLabel('Your fitness goal').fill('build a bit of strength');
    await page.getByRole('button', { name: 'Submit my answers' }).click();

    await expect(page).toHaveURL(/\/thank-you$/);
    await expect(page.getByRole('heading', { name: "Thanks — you're all set" })).toBeVisible();
  });

  test('submitted answers, including apostrophes, are visible to the operator', async ({ page, request }) => {
    const name = `${uniqueName()} O'Brien`;
    const res = await request.post('/intake', {
      form: {
        parentName: name,
        chores: 'school run, washing up',
        routineTimes: 'mornings before school',
        fitnessGoal: 'more energy',
      },
    });
    expect(res.status()).toBe(200);

    await page.goto('/admin');
    const row = page.locator('tbody tr', { hasText: name });
    await expect(row).toBeVisible();
    await expect(row.getByText('Pending')).toBeVisible();

    await row.getByRole('link', { name: 'View →' }).click();
    await expect(page.getByText('school run, washing up')).toBeVisible();
    await expect(page.getByText('mornings before school')).toBeVisible();
    await expect(page.getByText('more energy')).toBeVisible();
  });

  test('server rejects a submission with an empty required field, even bypassing client-side validation', async ({ request }) => {
    const res = await request.post('/intake', {
      form: { parentName: '', chores: 'x', routineTimes: 'y', fitnessGoal: 'z' },
    });
    expect(res.status()).toBe(400);
    const body = await res.text();
    expect(body).toContain('Please tell us your name.');
  });

  test('server rejects a submission where a required field is only whitespace', async ({ request }) => {
    const res = await request.post('/intake', {
      form: { parentName: '   ', chores: 'x', routineTimes: 'y', fitnessGoal: 'z' },
    });
    expect(res.status()).toBe(400);
    const body = await res.text();
    expect(body).toContain('Please tell us your name.');
  });
});
