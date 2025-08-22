const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mockTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
  answers: { type: Map, of: String }, // Stores question index as key and user's answer as value
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);