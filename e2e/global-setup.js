require('dotenv').config();
const mongoose = require('mongoose');

// Test data uses parentName values prefixed with "E2E " so this cleanup never
// touches real operator/pilot submissions in the shared dev database.
module.exports = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.collection('intakesubmissions').deleteMany({
    parentName: { $regex: /^E2E / },
  });
  // Chore-start events carry no parent identity to scope an "E2E " prefix to, and the
  // pilot has no real taps yet, so the whole collection is safe to clear between runs.
  await mongoose.connection.collection('chorestartevents').deleteMany({});
  await mongoose.disconnect();
};
