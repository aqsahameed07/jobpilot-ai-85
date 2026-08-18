const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { 
  sendVerificationEmail, 
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendPasswordResetConfirmation
} = require('../services/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// ============================================
// REGISTER USER
// ============================================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;


    console.log('Registering user with email:', req.body);
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      isDeleted: false
    });

    // Generate verification code
    const verificationCode = user.generateVerificationCode();
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user, verificationCode);
    } catch (emailError) {
      console.error('Email error:', emailError);
      return res.status(201).json({
        success: true,
        message: 'User created but verification email could not be sent. Please contact support.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Verification code sent to your email. Please verify within 10 minutes.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// LOGIN USER
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email, isDeleted: false })
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email first. Check your inbox for verification code.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// VERIFY EMAIL
// ============================================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code'
      });
    }

    const user = await User.findOne({ email, isDeleted: false })
      .select('+verificationCode +verificationCodeExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    const isVerified = user.verifyEmail(code);

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new one.'
      });
    }

    await user.save();

    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// RESEND VERIFICATION CODE
// ============================================
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    const verificationCode = user.generateVerificationCode();
    await user.save();

    await sendVerificationEmail(user, verificationCode);

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// GET CURRENT USER
// ============================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// LOGOUT
// ============================================
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// ============================================
// ✅ FORGOT PASSWORD
// ============================================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    const resetCode = user.generateResetPasswordCode();
    await user.save();

    await sendResetPasswordEmail(user, resetCode);

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// ✅ VERIFY RESET CODE
// ============================================
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and reset code'
      });
    }

    const user = await User.findOne({ email, isDeleted: false })
      .select('+resetPasswordCode +resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValid = user.verifyResetCode(code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Reset code verified successfully'
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// ✅ RESET PASSWORD
// ============================================
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, reset code, and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({ email, isDeleted: false })
      .select('+resetPasswordCode +resetPasswordExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isValid = user.verifyResetCode(code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    user.password = newPassword;
    await user.save();

    await sendPasswordResetConfirmation(user);

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// ✅ RESEND RESET CODE
// ============================================
exports.resendResetCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resetCode = user.generateResetPasswordCode();
    await user.save();

    await sendResetPasswordEmail(user, resetCode);

    res.status(200).json({
      success: true,
      message: 'New reset code sent to your email'
    });
  } catch (error) {
    console.error('Resend reset code error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ============================================
// ✅ GOOGLE LOGIN SUCCESS
// ============================================
// exports.googleSuccess = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.redirect('/api/auth/google/failed');
//     }

//     // Generate JWT token
//     const token = generateToken(req.user._id);

//     // Return user data with token
//     res.status(200).json({
//       success: true,
//       message: 'Google login successful',
//       token,
//       user: {
//         id: req.user._id,
//         name: req.user.name,
//         email: req.user.email,
//         role: req.user.role,
//         isVerified: req.user.isVerified,
//         profileImage: req.user.profileImage,
//         isGoogleUser: true
//       }
//     });
//   } catch (error) {
//     console.error('Google success error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// Add/modify these functions for Google OAuth redirect

// ============================================
// ✅ GOOGLE LOGIN SUCCESS - Redirect to Frontend
// ============================================
exports.googleSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth?error=google_auth_failed`);
    }

    // Generate JWT token
    const token = generateToken(req.user._id);

    // Redirect to frontend with token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/auth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
      profileImage: req.user.profileImage
    }))}`);
    
  } catch (error) {
    console.error('Google success error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=google_auth_failed`);
  }
};

// ============================================
// ✅ GOOGLE LOGIN FAILED
// ============================================
exports.googleFailed = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth?error=google_auth_failed`);
}

;
// ============================================
// ✅ GOOGLE LOGIN FAILED
// ============================================
// exports.googleFailed = (req, res) => {
//   res.status(401).json({
//     success: false,
//     message: 'Google authentication failed'
//   });
// };

// ============================================
// ✅ GOOGLE REDIRECT HANDLER
// ============================================
exports.googleRedirect = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Google authentication successful. You are being redirected.'
  });
};
