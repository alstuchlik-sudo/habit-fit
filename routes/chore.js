const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const ChoreStartEvent = require('../models/ChoreStartEvent');

const router = express.Router();

const CHORE_LABELS = {
  cleaning: 'Cleaning',
  dishes: 'Dishes',
  mowing: 'Mowing',
  laundry: 'Laundry',
};

router.get('/start', (req, res) => {
  res.render('start-chore', {
    title: 'Start a chore · Habit Fit',
    choreTypes: ChoreStartEvent.CHORE_TYPES,
    choreLabels: CHORE_LABELS,
    started: ChoreStartEvent.CHORE_TYPES.includes(req.query.started) ? req.query.started : null,
  });
});

router.post(
  '/start/:choreType',
  asyncHandler(async (req, res) => {
    const { choreType } = req.params;
    if (!ChoreStartEvent.CHORE_TYPES.includes(choreType)) {
      return res.status(404).render('404');
    }
    await ChoreStartEvent.create({ choreType });
    res.redirect(`/start?started=${choreType}`);
  })
);

module.exports = router;
