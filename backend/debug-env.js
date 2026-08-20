const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config();

console.log('=== ENVIRONMENT VARIABLES ===');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ SET' : '✗ MISSING');
console.log('SMTP_PASS length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);
console.log('SMTP_PASS characters:', process.env.SMTP_PASS ? JSON.stringify(process.env.SMTP_PASS) : 'none');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('===============================');