const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Stats route (must be before :id route)
router.get('/stats', applicationController.getApplicationStats);

// Get applications by status
router.get('/status/:status', applicationController.getApplicationsByStatus);

// CRUD routes
router.route('/')
  .get(applicationController.getAllApplications)
  .post(applicationController.createApplication);

router.route('/:id')
  .get(applicationController.getApplicationById)
  .put(applicationController.updateApplication)
  .delete(applicationController.deleteApplication);

// Update status
router.patch('/:id/status', applicationController.updateApplicationStatus);

module.exports = router;