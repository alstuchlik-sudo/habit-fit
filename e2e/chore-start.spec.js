// FAFBP-37: User manually indicates when a chore is starting with a single tap
const { test, expect } = require('@playwright/test');
const mongoose = require('mongoose');

test.describe('Start a chore (FAFBP-37)', () => {
  test('a tap target exists for every chore type on one screen', async ({ page }) => {
    await page.goto('/start');
    await expect(page.getByRole('button', { name: 'Cleaning' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dishes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mowing' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Laundry' })).toBeVisible();
  });

  test('tapping a chore button logs a chore-start event with a timestamp and confirms on screen', async ({ page }) => {
    const before = Date.now();
    await page.goto('/start');
    await page.getByRole('button', { name: 'Dishes' }).click();

    await expect(page).toHaveURL(/\/start\?started=dishes$/);
    await expect(page.getByText("Dishes logged — go get 'em!")).toBeVisible();

    await mongoose.connect(process.env.MONGODB_URI);
    const event = await mongoose.connection
      .collection('chorestartevents')
      .findOne({ choreType: 'dishes' }, { sort: { startedAt: -1 } });
    await mongoose.disconnect();

    expect(event).toBeTruthy();
    expect(new Date(event.startedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  test('posting an unknown chore type is rejected rather than silently logged', async ({ request }) => {
    const res = await request.post('/start/vacuuming');
    expect(res.status()).toBe(404);
  });
});
