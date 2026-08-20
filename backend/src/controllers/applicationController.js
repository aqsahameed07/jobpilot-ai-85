const Application = require('../models/Application');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({ 
      user: req.user.id,
      deleted: false 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id,
      deleted: false
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res) => {
  try {
    const { company, position, status, salary, location, job_description, notes, applied_at } = req.body;

    // Validate required fields
    if (!company || !position) {
      return res.status(400).json({
        success: false,
        message: 'Company and position are required'
      });
    }

    const application = await Application.create({
      user: req.user.id,
      company,
      position,
      status: status || 'applied',
      salary: salary || '',
      location: location || '',
      job_description: job_description || '',
      notes: notes || '',
      applied_at: applied_at || new Date().toISOString().slice(0, 10)
    });

    res.status(201).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res) => {
  try {
    let application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id,
      deleted: false
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const { company, position, status, salary, location, job_description, notes, applied_at } = req.body;

    // Update fields
    if (company) application.company = company;
    if (position) application.position = position;
    if (status) application.status = status;
    if (salary !== undefined) application.salary = salary;
    if (location !== undefined) application.location = location;
    if (job_description !== undefined) application.job_description = job_description;
    if (notes !== undefined) application.notes = notes;
    if (applied_at) application.applied_at = applied_at;

    await application.save();

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }

    const validStatuses = ['applied', 'interview', 'offer', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: applied, interview, offer, rejected'
      });
    }

    let application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id,
      deleted: false
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete application (soft delete)
// @route   DELETE /api/applications/:id
// @access  Private
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user.id,
      deleted: false
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Soft delete
    application.deleted = true;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get applications by status
// @route   GET /api/applications/status/:status
// @access  Private
exports.getApplicationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['applied', 'interview', 'offer', 'rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: applied, interview, offer, rejected'
      });
    }

    const applications = await Application.find({
      user: req.user.id,
      status,
      deleted: false
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Get applications by status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get application stats
// @route   GET /api/applications/stats
// @access  Private
exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      { $match: { user: req.user._id, deleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const total = stats.reduce((sum, s) => sum + s.count, 0);
    const interviews = stats.find(s => s._id === 'interview')?.count || 0;
    const offers = stats.find(s => s._id === 'offer')?.count || 0;
    const responseRate = total ? Math.round(((interviews + offers) / total) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        total,
        applied: stats.find(s => s._id === 'applied')?.count || 0,
        interview: interviews,
        offer: offers,
        rejected: stats.find(s => s._id === 'rejected')?.count || 0,
        responseRate
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};