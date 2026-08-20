const { deleteUnverifiedUsers } = require('../services/cleanupService');

/**
 * Start the cleanup job that runs every 1 minute
 */
const startCleanupJob = () => {
  console.log('🔄 Starting cleanup job (runs every 1 minute)');
  
  // Run immediately on startup
  deleteUnverifiedUsers();
  
  // Then run every 1 minute
  setInterval(async () => {
    await deleteUnverifiedUsers();
  }, 60 * 1000); // 60 seconds = 1 minute
  
  console.log('✅ Cleanup job started');
};

module.exports = {
  startCleanupJob
};