const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// All user routes are protected
router.use(auth);

// ✅ Profile Routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);


// ✅ Resume Routes
router.put('/profile/resume', userController.saveResumeText);
router.post('/profile/resume-upload', userController.uploadResumeFile);
router.delete('/profile/resume', userController.removeResumeFile);

// ✅ Settings Routes
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);

// ✅ Admin Routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;