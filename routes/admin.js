const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const IntakeSubmission = require('../models/IntakeSubmission');

const router = express.Router();

function withComputedStatus(submission) {
  const obj = submission.toObject ? submission.toObject() : submission;
  obj.isOverdue = obj.status === 'pending' && new Date(obj.dueBy) < new Date();
  return obj;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const submissions = await IntakeSubmission.find().sort({ createdAt: -1 });
    const rows = submissions.map(withComputedStatus);
    res.render('admin/dashboard', {
      title: 'Operator dashboard · Habit Fit',
      submissions: rows,
    });
  })
);

router.get(
  '/submissions/:id',
  asyncHandler(async (req, res) => {
    const submission = await IntakeSubmission.findById(req.params.id);
    if (!submission) return res.status(404).render('404');
    res.render('admin/submission-detail', {
      title: 'Build starter schedule · Habit Fit',
      submission: withComputedStatus(submission),
      saved: req.query.saved === '1',
    });
  })
);

router.post(
  '/submissions/:id/schedule',
  asyncHandler(async (req, res) => {
    const submission = await IntakeSubmission.findById(req.params.id);
    if (!submission) return res.status(404).render('404');

    const chores = [].concat(req.body.chore || []);
    const exercises = [].concat(req.body.exercise || []);
    const timings = [].concat(req.body.timing || []);

    const items = chores
      .map((chore, i) => ({
        chore: (chore || '').trim(),
        exercise: (exercises[i] || '').trim(),
        timing: (timings[i] || '').trim(),
      }))
      .filter((item) => item.chore && item.exercise && item.timing);

    submission.scheduleItems = items;
    if (items.length > 0) {
      submission.status = 'scheduled';
      submission.scheduledAt = new Date();
    } else {
      submission.status = 'pending';
      submission.scheduledAt = undefined;
    }

    await submission.save();
    res.redirect(`/admin/submissions/${submission._id}?saved=1`);
  })
);

module.exports = router;
