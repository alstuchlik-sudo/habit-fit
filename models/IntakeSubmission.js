const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema(
  {
    chore: { type: String, required: true, trim: true },
    exercise: { type: String, required: true, trim: true },
    timing: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const intakeSubmissionSchema = new mongoose.Schema({
  parentName: { type: String, required: true, trim: true },
  chores: { type: String, required: true, trim: true },
  routineTimes: { type: String, required: true, trim: true },
  fitnessGoal: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'scheduled'], default: 'pending' },
  dueBy: { type: Date, required: true },
  scheduleItems: { type: [scheduleItemSchema], default: [] },
  scheduledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

intakeSubmissionSchema.pre('validate', function setDueBy(next) {
  if (!this.dueBy) {
    this.dueBy = new Date(Date.now() + TWENTY_FOUR_HOURS_MS);
  }
  next();
});

module.exports = mongoose.model('IntakeSubmission', intakeSubmissionSchema);
