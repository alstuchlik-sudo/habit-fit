const mongoose = require('mongoose');

const CHORE_TYPES = ['cleaning', 'dishes', 'mowing', 'laundry'];

const choreStartEventSchema = new mongoose.Schema({
  choreType: { type: String, required: true, enum: CHORE_TYPES },
  startedAt: { type: Date, default: Date.now },
});

const ChoreStartEvent = mongoose.model('ChoreStartEvent', choreStartEventSchema);
ChoreStartEvent.CHORE_TYPES = CHORE_TYPES;

module.exports = ChoreStartEvent;
