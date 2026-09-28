require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const seedInitialData = require('./seed');
const { authenticate } = require('./middleware/auth');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { settingsRouter } = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Global auth extractor middleware
app.use(authenticate);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'VK Dry Clean Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRouter);

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

// Start Server and Database
const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    const serverInstance = app.listen(PORT, () => {
      console.log(`🚀 VK Dry Clean Server running on http://localhost:${PORT}`);
      console.log(`📡 REST API Base: http://localhost:${PORT}/api`);
    });

    const shutdown = async () => {
      console.log('Graceful shutdown initiated...');
      serverInstance.close();
      await disconnectDB();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
