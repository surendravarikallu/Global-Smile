const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();

const app = express();
// In dev: Express runs on 5001 (Vite proxies from 5000 → 5001)
// In prod: Express runs on 5000 (serves dist/ directly)
const PORT = process.env.NODE_ENV === 'production'
  ? (process.env.PORT || 5000)
  : (process.env.API_PORT || 5001);

// ─── Security Middleware ───────────────────────
// Helmet: sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for SPA — assets served from same origin
  crossOriginEmbedderPolicy: false,
}));

// CORS: restrict to known origins in production
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ─── Body Parsing ──────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Response Compression ──────────────────────
app.use(compression());

// ─── Simple In-Memory Rate Limiter ─────────────
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window (general)
const AI_RATE_LIMIT_MAX = 10; // AI endpoints (expensive)

function rateLimit(max = RATE_LIMIT_MAX) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}:${req.baseUrl}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (entry && now - entry.start < RATE_LIMIT_WINDOW_MS) {
      if (entry.count >= max) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.start)) / 1000),
        });
      }
      entry.count++;
    } else {
      rateLimitStore.set(key, { count: 1, start: now });
    }
    next();
  };
}

// Clean up stale rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.start > RATE_LIMIT_WINDOW_MS * 2) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

// ─── Request Logger (dev only) ─────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      const status = res.statusCode;
      const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m';
      console.log(`  ${color}${req.method}\x1b[0m ${req.path} \x1b[90m${status} ${ms}ms\x1b[0m`);
    });
    next();
  });
}

// ─── Static Uploads ────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '7d', // Cache static uploads
  etag: true,
}));

// ─── API Routes ────────────────────────────────
app.use('/api/auth', rateLimit(30), require('./routes/auth.routes.cjs'));
app.use('/api/patients', rateLimit(), require('./routes/patient.routes.cjs'));
app.use('/api/admin', rateLimit(), require('./routes/admin.routes.cjs'));
app.use('/api/ai', rateLimit(AI_RATE_LIMIT_MAX), require('./routes/ai.routes.cjs'));
app.use('/api/referrals', rateLimit(), require('./routes/referral.routes.cjs'));
app.use('/api/appointments', rateLimit(), require('./routes/appointment.routes.cjs'));
app.use('/api/files', rateLimit(20), require('./routes/file.routes.cjs'));
app.use('/api/tourism', rateLimit(), require('./routes/tourism.routes.cjs'));
app.use('/api/notifications', rateLimit(), require('./routes/notification.routes.cjs'));
// Module 5: Patient Follow-Up System
app.use('/api/medications', rateLimit(), require('./routes/medication.routes.cjs'));
app.use('/api/followups', rateLimit(), require('./routes/followup.routes.cjs'));

// ─── Health Check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    },
  });
});

// ─── Production: Serve React Build ─────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist'), {
    maxAge: '30d',
    etag: true,
  }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// ─── 404 Handler ───────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api/') && !res.headersSent) {
    return res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  }
  next();
});

// ─── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large. Maximum size is 10MB.' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
  }

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// ─── Graceful Shutdown ─────────────────────────
const { startReminderCron } = require('./services/notification.service.cjs');
startReminderCron();

const server = app.listen(PORT, () => {
  console.log(`\n  🦷 Global Smile API Server`);
  console.log(`  ─────────────────────────`);
  console.log(`  → Local:   http://localhost:${PORT}`);
  console.log(`  → API:     http://localhost:${PORT}/api`);
  console.log(`  → Health:  http://localhost:${PORT}/api/health`);
  console.log(`  → Mode:    ${process.env.NODE_ENV || 'development'}\n`);
});

process.on('SIGTERM', () => {
  console.log('\n  ⚡ Graceful shutdown initiated...');
  server.close(() => {
    console.log('  ✓ Server closed. Goodbye.\n');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

module.exports = app;
