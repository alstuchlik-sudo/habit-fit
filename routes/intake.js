const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const IntakeSubmission = require('../models/IntakeSubmission');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('intake-form', { title: 'Get your starter plan · Habit Fit', errors: null, values: {} });
});

router.post(
  '/intake',
  asyncHandler(async (req, res) => {
    const { parentName, chores, routineTimes, fitnessGoal } = req.body;

    const errors = [];
    if (!parentName || !parentName.trim()) errors.push('Please tell us your name.');
    if (!chores || !chores.trim()) errors.push('Please list the chores you already do.');
    if (!routineTimes || !routineTimes.trim()) errors.push('Please tell us when your routine happens.');
    if (!fitnessGoal || !fitnessGoal.trim()) errors.push('Please tell us your fitness goal.');

    if (errors.length) {
      return res.status(400).render('intake-form', {
        title: 'Get your starter plan · Habit Fit',
        errors,
        values: { parentName, chores, routineTimes, fitnessGoal },
      });
    }

    await IntakeSubmission.create({
      parentName: parentName.trim(),
      chores: chores.trim(),
      routineTimes: routineTimes.trim(),
      fitnessGoal: fitnessGoal.trim(),
    });

    res.redirect('/thank-you');
  })
);

router.get('/thank-you', (req, res) => {
  res.render('thank-you', { title: 'Thanks · Habit Fit' });
});

module.exports = router;
