import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Load Environment Variables
dotenv.config();

// Database Connection
import { connectDB } from './config/db.js';

// Middlewares
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { sanitizeInputs } from './middleware/security.js';

// Route Imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import donorRoutes from './routes/donorRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Establish Database Connection
connectDB();

// 2. Security HTTP Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 3. Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('rakthalink') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 4. Request Logging (Morgan)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 5. Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Security Input Sanitization (NoSQL Injection & Parameter Guard)
app.use(sanitizeInputs);

// 7. Global Rate Limiter
app.use('/api', generalLimiter);

// 8. Base Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'RakthaLink AI REST API',
    tagline: 'Connecting Blood. Connecting Lives.',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'ACTIVE',
  });
});

// 9. Mount API Routes (Supported both with /api prefix and root prefix for robustness)
const mountAppRoutes = (prefix = '') => {
  app.use(`${prefix}/health`, healthRoutes);
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/donors`, donorRoutes);
  app.use(`${prefix}/requests`, requestRoutes);
  app.use(`${prefix}/matches`, matchRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/appointments`, appointmentRoutes);
  app.use(`${prefix}/ai`, aiRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/reports`, reportRoutes);
  app.use(`${prefix}/chat`, chatRoutes);
};

mountAppRoutes('/api');
mountAppRoutes('');

// 10. 404 Not Found & Global Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// 11. Start Server Listener
const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 RakthaLink AI Server running in [${process.env.NODE_ENV || 'development'}] mode`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👑 Designated Admin: ${process.env.ADMIN_EMAILS || 'dharshang317@gmail.com'}`);
  console.log('====================================================');
});

// Handle Unhandled Promise Rejections & Process Signals
process.on('unhandledRejection', (err) => {
  console.error('[CRITICAL] Unhandled Rejection:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

export default app;
