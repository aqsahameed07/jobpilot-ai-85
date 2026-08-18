const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is updating their own profile or is admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        full_name: user.full_name,
        headline: user.headline,
        location: user.location,
        target_role: user.target_role,
        avatar_url: user.avatar_url,
        profileImage: user.profileImage,
        resume_text: user.resume_text,
        resume_file_path: user.resume_file_path,
        resume_file_name: user.resume_file_name,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, headline, location, target_role, avatar_url } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update profile fields
    if (full_name !== undefined) user.full_name = full_name?.trim() || null;
    if (headline !== undefined) user.headline = headline?.trim() || null;
    if (location !== undefined) user.location = location?.trim() || null;
    if (target_role !== undefined) user.target_role = target_role?.trim() || null;
    if (avatar_url !== undefined) user.avatar_url = avatar_url || null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        full_name: user.full_name,
        headline: user.headline,
        location: user.location,
        target_role: user.target_role,
        avatar_url: user.avatar_url,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save master resume text
// @route   PUT /api/users/profile/resume
// @access  Private
exports.saveResumeText = async (req, res) => {
  try {
    const { resume_text } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.resume_text = resume_text?.trim() || null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume saved successfully',
      resume_text: user.resume_text
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload resume file
// @route   POST /api/users/profile/resume-upload
// @access  Private
exports.uploadResumeFile = async (req, res) => {
  try {
    const { resume_file_path, resume_file_name } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.resume_file_path = resume_file_path || null;
    user.resume_file_name = resume_file_name || null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume file uploaded successfully',
      resume_file_path: user.resume_file_path,
      resume_file_name: user.resume_file_name
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove resume file
// @route   DELETE /api/users/profile/resume
// @access  Private
exports.removeResumeFile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.resume_file_path = null;
    user.resume_file_name = null;
    user.resume_text = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { emailNotifications, jobAlerts, weeklyDigest, theme, language } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update settings with provided values or keep existing
    user.settings = {
      emailNotifications: emailNotifications !== undefined ? emailNotifications : user.settings.emailNotifications,
      jobAlerts: jobAlerts !== undefined ? jobAlerts : user.settings.jobAlerts,
      weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : user.settings.weeklyDigest,
      theme: theme || user.settings.theme,
      language: language || user.settings.language
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};