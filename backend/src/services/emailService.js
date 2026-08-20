const nodemailer = require('nodemailer');
require('dotenv').config();

// Log credentials (for debugging)
console.log('📧 Loading email config...');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set (length: ' + process.env.SMTP_PASS.length + ')' : '❌ Missing');

// Create transporter with proper config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Error:', error.message);
  } else {
    console.log('✅ SMTP Ready to send emails');
  }
});

// ============================================
// 1. SEND VERIFICATION EMAIL
// ============================================
const sendVerificationEmail = async (user, code) => {
  try {
    console.log('========================================');
    console.log(`📧 Verification Code for ${user.email}:`);
    console.log(`🔑 CODE: ${code}`);
    console.log(`⏰ Expires in 10 minutes`);
    console.log('========================================');

    const mailOptions = {
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '🔐 Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Verify Your Email</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 16px; color: #555;">Your verification code is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea;">
              <h2 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${code}</h2>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">⏰ This code expires in <strong>10 minutes</strong></p>
            <p style="font-size: 14px; color: #888; text-align: center;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${user.email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return info;
    
  } catch (error) {
    console.error('❌ Failed to send email to:', user.email);
    console.error('Error:', error.message);
    console.log(`🔑 But the code is: ${code}`);
    return null;
  }
};

// ============================================
// 2. SEND WELCOME EMAIL
// ============================================
const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '🎉 Welcome to Our App!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Welcome ${user.name}! 🎉</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Your email has been successfully verified!</p>
            <p style="font-size: 16px; color: #555;">You can now access all features of our platform.</p>
            <div style="background: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">🚀 Start exploring now</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error.message);
  }
};

// ============================================
// 3. ✅ NEW: SEND RESET PASSWORD EMAIL
// ============================================
const sendResetPasswordEmail = async (user, code) => {
  try {
    console.log('========================================');
    console.log(`🔑 RESET PASSWORD CODE FOR:`);
    console.log(`📨 Email: ${user.email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🔑 CODE: ${code}`);
    console.log(`⏰ Expires in 10 minutes`);
    console.log('========================================');

    const mailOptions = {
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '🔑 Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Reset Your Password</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 16px; color: #555;">You requested to reset your password. Use the code below:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #f5576c;">
              <h2 style="color: #f5576c; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${code}</h2>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">⏰ This code expires in <strong>10 minutes</strong></p>
            <p style="font-size: 14px; color: #888; text-align: center;">If you didn't request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reset password email sent to ${user.email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return info;
    
  } catch (error) {
    console.error('❌ Failed to send reset password email to:', user.email);
    console.error('Error:', error.message);
    console.log(`🔑 But the code is: ${code}`);
    return null;
  }
};

// ============================================
// 4. ✅ NEW: SEND PASSWORD RESET CONFIRMATION
// ============================================
const sendPasswordResetConfirmation = async (user) => {
  try {
    const mailOptions = {
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: '✅ Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Password Reset Successful</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 16px; color: #555;">Your password has been successfully reset.</p>
            <div style="background: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">🔐 You can now login with your new password</p>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">If you didn't request this, please contact support immediately.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} Your App. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset confirmation sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Failed to send password reset confirmation:', error.message);
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendPasswordResetConfirmation
};