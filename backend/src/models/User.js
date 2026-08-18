const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationCodeExpires: {
    type: Date,
    select: false
  },
  resetPasswordCode: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  // ✅ NEW: Google OAuth Fields
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  profileImage: {
    type: String,
    default: null
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  // ✅ Profile Fields
  full_name: {
    type: String,
    trim: true,
    maxlength: [120, 'Full name cannot exceed 120 characters'],
    default: null
  },
  headline: {
    type: String,
    trim: true,
    maxlength: [160, 'Headline cannot exceed 160 characters'],
    default: null
  },
  location: {
    type: String,
    trim: true,
    maxlength: [120, 'Location cannot exceed 120 characters'],
    default: null
  },
  target_role: {
    type: String,
    trim: true,
    maxlength: [120, 'Target role cannot exceed 120 characters'],
    default: null
  },
  avatar_url: {
    type: String,
    default: null
  },
  // ✅ Resume Fields
  resume_text: {
    type: String,
    default: null
  },
  resume_file_path: {
    type: String,
    default: null
  },
  resume_file_name: {
    type: String,
    default: null
  },
  // ✅ Settings Fields
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    jobAlerts: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Generate verification code
userSchema.methods.generateVerificationCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
  return code;
};

// Verify email with code
userSchema.methods.verifyEmail = function(code) {
  if (this.verificationCode === code && this.verificationCodeExpires > Date.now()) {
    this.isVerified = true;
    this.verificationCode = undefined;
    this.verificationCodeExpires = undefined;
    return true;
  }
  return false;
};

// Generate reset password code
userSchema.methods.generateResetPasswordCode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordCode = code;
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return code;
};

// Verify reset password code
userSchema.methods.verifyResetCode = function(code) {
  if (this.resetPasswordCode === code && this.resetPasswordExpires > Date.now()) {
    this.resetPasswordCode = undefined;
    this.resetPasswordExpires = undefined;
    return true;
  }
  return false;
};

// Static method to find user by email (excluding deleted)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email, isDeleted: false });
};

// Instance method to soft delete user
userSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  return await this.save();
};

// Instance method to restore user
userSchema.methods.restore = async function() {
  this.isDeleted = false;
  return await this.save();
};

// Middleware to exclude deleted users from queries
userSchema.pre(/^find/, function() {
  if (!this._conditions || !this._conditions._id) {
    this.where({ isDeleted: false });
  }
});

// Delete unverified users after 5 minutes
userSchema.statics.deleteUnverifiedUsers = async function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const result = await this.deleteMany({
    isVerified: false,
    createdAt: { $lt: fiveMinutesAgo }
  });
  if (result.deletedCount > 0) {
    console.log(`🗑️ Deleted ${result.deletedCount} unverified users (older than 5 minutes)`);
  }
  return result;
};

module.exports = mongoose.model('User', userSchema);