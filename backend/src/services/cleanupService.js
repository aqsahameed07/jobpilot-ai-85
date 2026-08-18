const User = require('../models/User');

/**
 * Delete unverified users that are older than 5 minutes
 */
const deleteUnverifiedUsers = async () => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Find unverified users older than 5 minutes
    const unverifiedUsers = await User.find({
      isVerified: false,
      createdAt: { $lt: fiveMinutesAgo },
      isDeleted: false
    });
    

    if (unverifiedUsers.length === 0) {
      // No users to delete
      return { deletedCount: 0 };
    }

    // Delete them permanently
    const result = await User.deleteMany({
      _id: { $in: unverifiedUsers.map(u => u._id) }
    });

    console.log(`🗑️ Deleted ${result.deletedCount} unverified users`);
    
    // Log each deleted user's email
    unverifiedUsers.forEach(user => {
      console.log(`   📧 ${user.email} (created: ${user.createdAt})`);
    });

    return result;
    
  } catch (error) {
    console.error('❌ Error deleting unverified users:', error.message);
    return { deletedCount: 0, error: error.message };
  }
};

module.exports = {
  deleteUnverifiedUsers
};