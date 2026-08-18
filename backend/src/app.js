const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const indexRoutes = require('./routes/indexRoutes'); // ✅ Import index routes
const errorHandler = require('./middleware/errorHandler');

// Import passport config
require('./config/passport');

const app = express();

// ============================================
// CORS CONFIGURATION
// ============================================
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// ============================================
// SESSION CONFIGURATION
// ============================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax',
    },
  })
);

// ============================================
// PASSPORT MIDDLEWARE
// ============================================
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// OTHER MIDDLEWARE
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES - Using index routes
// ============================================
app.use('/api', indexRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    version: '1.0.0',
    googleAuth: 'GET /api/auth/google',
  });
});

// Health check route (optional - also available at /api/health)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;