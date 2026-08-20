const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  company: {
    type: String,
    required: [true, 'Please add a company name'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  position: {
    type: String,
    required: [true, 'Please add a position'],
    trim: true,
    maxlength: [100, 'Position cannot be more than 100 characters']
  },
  status: {
    type: String,
    enum: ['applied', 'interview', 'offer', 'rejected'],
    default: 'applied'
  },
  salary: {
    type: String,
    trim: true,
    maxlength: [50, 'Salary cannot be more than 50 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  job_description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Job description cannot be more than 2000 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  applied_at: {
    type: String,
    required: true,
    default: () => new Date().toISOString().slice(0, 10)
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, applied_at: -1 });

module.exports = mongoose.model('Application', applicationSchema);