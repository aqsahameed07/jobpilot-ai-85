const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const testEmail = async () => {
  try {
    console.log('📧 Testing email configuration...');
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`SMTP User: ${process.env.SMTP_USER}`);
    console.log(`SMTP Pass: ${process.env.SMTP_PASS ? '✓ Set' : '✗ Not set'}`);
    console.log('----------------------------------------');
    
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: 'aqsahameed305@gmail.com',
      subject: '✅ Test Email - Verification System Working!',
      html: `
        <h1 style="color: #4CAF50;">✅ Email Configuration Working!</h1>
        <p>Your SMTP configuration is correct.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <p>You can now send verification emails.</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📨 Sent to: aqsahameed305@gmail.com`);
    console.log('Check your inbox (or spam folder)');
    
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error(`Message: ${error.message}`);
    
    if (error.response) {
      console.error('Server Response:', error.response);
    }
    
    if (error.code === 'EAUTH') {
      console.log('\n🔑 Authentication Error! Make sure:');
      console.log('1. App password is correct (no spaces)');
      console.log('2. 2FA is enabled on your Gmail');
      console.log('3. SMTP_USER is your full email');
    }
  }
};

testEmail();