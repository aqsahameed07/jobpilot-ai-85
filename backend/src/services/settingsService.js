/**
 * Settings Service
 * Handles user settings and preferences management
 */

const User = require('../models/User');

class SettingsService {
  /**
   * Get user settings
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User settings object
   */
  
  async getSettings(userId) {
    try {
      const user = await User.findById(userId).select('settings email');
      if (!user) {
        throw new Error('User not found');
      }
      return {
        settings: user.settings,
        email: user.email
      };
    } catch (error) {
      throw new Error(`Failed to get settings: ${error.message}`);
    }
  }

  /**
   * Update user settings
   * @param {String} userId - User ID
   * @param {Object} settingsUpdate - Settings to update
   * @returns {Promise<Object>} Updated settings
   */
  async updateSettings(userId, settingsUpdate) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const allowedFields = ['emailNotifications', 'jobAlerts', 'weeklyDigest', 'theme', 'language'];
      const validUpdate = {};

      allowedFields.forEach(field => {
        if (field in settingsUpdate) {
          validUpdate[field] = settingsUpdate[field];
        }
      });

      user.settings = {
        ...user.settings,
        ...validUpdate
      };

      await user.save();
      return user.settings;
    } catch (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }

  /**
   * Get email notification setting
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} Email notifications enabled
   */
  async getEmailNotifications(userId) {
    try {
      const user = await User.findById(userId).select('settings.emailNotifications');
      if (!user) {
        throw new Error('User not found');
      }
      return user.settings.emailNotifications;
    } catch (error) {
      throw new Error(`Failed to get email notifications setting: ${error.message}`);
    }
  }

  /**
   * Toggle email notifications
   * @param {String} userId - User ID
   * @param {Boolean} enabled - Enable or disable
   * @returns {Promise<Boolean>} Updated setting
   */
  async toggleEmailNotifications(userId, enabled) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      user.settings.emailNotifications = enabled;
      await user.save();
      return user.settings.emailNotifications;
    } catch (error) {
      throw new Error(`Failed to toggle email notifications: ${error.message}`);
    }
  }

  /**
   * Toggle job alerts
   * @param {String} userId - User ID
   * @param {Boolean} enabled - Enable or disable
   * @returns {Promise<Boolean>} Updated setting
   */
  async toggleJobAlerts(userId, enabled) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      user.settings.jobAlerts = enabled;
      await user.save();
      return user.settings.jobAlerts;
    } catch (error) {
      throw new Error(`Failed to toggle job alerts: ${error.message}`);
    }
  }

  /**
   * Set theme preference
   * @param {String} userId - User ID
   * @param {String} theme - Theme ('light', 'dark', 'auto')
   * @returns {Promise<String>} Updated theme
   */
  async setTheme(userId, theme) {
    try {
      const validThemes = ['light', 'dark', 'auto'];
      if (!validThemes.includes(theme)) {
        throw new Error(`Invalid theme: ${theme}. Must be one of: ${validThemes.join(', ')}`);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      user.settings.theme = theme;
      await user.save();
      return user.settings.theme;
    } catch (error) {
      throw new Error(`Failed to set theme: ${error.message}`);
    }
  }

  /**
   * Set language preference
   * @param {String} userId - User ID
   * @param {String} language - Language code (e.g., 'en', 'es', 'fr')
   * @returns {Promise<String>} Updated language
   */
  async setLanguage(userId, language) {
    try {
      const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ru'];
      if (!supportedLanguages.includes(language)) {
        console.warn(`Language ${language} not in default list, allowing anyway`);
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      user.settings.language = language;
      await user.save();
      return user.settings.language;
    } catch (error) {
      throw new Error(`Failed to set language: ${error.message}`);
    }
  }

  /**
   * Reset settings to defaults
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Default settings
   */
  async resetSettingsToDefaults(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.settings = {
        emailNotifications: true,
        jobAlerts: true,
        weeklyDigest: false,
        theme: 'auto',
        language: 'en'
      };

      await user.save();
      return user.settings;
    } catch (error) {
      throw new Error(`Failed to reset settings: ${error.message}`);
    }
  }
}

module.exports = new SettingsService();
