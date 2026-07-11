const express = require('express');
const cors = require('cors');
const importRoutes = require('./routes/import.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Support multiple origins: FRONTEND_URL can be comma-separated
// Also allows all *.vercel.app preview URLs automatically
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

function isOriginAllowed(origin) {
  // Allow any *.vercel.app subdomain (handles preview + production deployments)
  if (origin.endsWith('.vercel.app')) return true;
  // Allow explicitly listed origins from FRONTEND_URL env var
  if (allowedOrigins.includes(origin)) return true;
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);



app.use(express.json({ limit: '10mb' }));

// ── Routes ──────────────────────────────────────────────────
app.get('/', (_req, res) =>
  res.json({
    name: 'GrowEasy AI CSV Importer API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      import: 'POST /api/import',
    },
  })
);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use('/api', importRoutes);

// ── Error handler (must be last) ────────────────────────────
app.use(errorHandler);

module.exports = app;
