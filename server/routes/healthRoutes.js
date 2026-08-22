import express from 'express';
import mongoose from 'mongoose';
import { sendSuccess } from '../utils/apiResponse.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    System Health & Diagnostic Check with Live Database State
 * @access  Public
 */
router.get('/', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  // Mongoose connection state mappings
  const dbStates = {
    0: 'DISCONNECTED',
    1: 'CONNECTED (READY)',
    2: 'CONNECTING',
    3: 'DISCONNECTING',
  };

  const dbState = mongoose.connection.readyState;

  const healthData = {
    platform: 'RakthaLink AI - Backend REST API',
    status: dbState === 1 ? 'HEALTHY' : 'DEGRADED_DATABASE_DISCONNECTED',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    },
    database: {
      status: dbStates[dbState] || 'UNKNOWN',
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
    },
    services: {
      googleOAuth: 'Configured (Phase 5 Ready)',
      aiGateway: 'Configured (Phase 15 Ready)',
    },
  };

  return sendSuccess(res, 200, 'RakthaLink AI Backend is online', healthData);
});

export default router;
