const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();

// Debug environment variables
console.log('Environment variables:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Logging middleware
app.use(morgan('dev'));

// Custom middleware for additional security headers
app.use((req, res, next) => {
  // Remove X-Powered-By header (redundant with helmet but kept for reference)
  res.removeHeader('X-Powered-By');
  
  // Set security headers (some may be redundant with helmet)
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'no-referrer');
  res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
});

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Development environment - allow common development origins
    if (process.env.NODE_ENV === 'development') {
      const allowedOrigins = [
        /^http:\/\/localhost(:\d+)?$/,  // Localhost with any port
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,  // Localhost IP
        /^http:\/\/10\.0\.2\.2(:\d+)?$/,  // Android emulator
        /^exp:\/\//,  // Expo URLs (Android/iOS)
        /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/  // Local network
      ];
      
      const isAllowed = allowedOrigins.some(regex => regex.test(origin));
      return callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
    }
    
    // Production environment - only allow specific domains
    const allowedOrigins = [
      // Add your production domains here, e.g.:
      // 'https://yourapp.com',
      // 'https://www.yourapp.com'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`[CORS] Blocked request from: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

// Apply CORS with preflight
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes
// Allow larger JSON payloads (e.g., base64 images)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const bookingRoutes = require('./routes/booking.routes');
const ratingRoutes = require('./routes/rating.routes');
const notificationRoutes = require('./routes/notification.routes');

// Use routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);

// Temporary test route for debugging backend logging
app.use('/test-log', (req, res) => {
  console.log('Test route hit!');
  res.send('OK');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`🚀 Server running at http://${host}:${port}`);
  console.log(`🌐 Accessible on your local network at: http://${require('ip').address()}:${port}`);
  console.log('🛡️  CORS enabled for all origins in development');
  console.log('📡 Available endpoints:');
  console.log(`   - GET  /health          - Health check`);
  console.log(`   - GET  /products        - Get all products`);
  console.log(`   - GET  /products/:id    - Get product by ID`);
  console.log(`   - POST /products        - Create new product (protected)`);
  console.log(`   - PUT  /products/:id    - Update product (protected)`);
  console.log(`   - DEL  /products/:id    - Delete product (protected)`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM (for Docker)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
}); 