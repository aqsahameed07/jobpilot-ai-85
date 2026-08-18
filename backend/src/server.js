const app = require('./app');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startCleanupJob } = require('./jobs/cleanupJob');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start cleanup job
startCleanupJob();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('⏰ Auto-delete unverified users after 5 minutes');
  console.log('🔑 Google Auth: http://localhost:5000/api/auth/google');
});