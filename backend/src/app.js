const express = require('express');
const cors = require('cors');
const importRoutes = require('./routes/import.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Support multiple origins: FRONTEND_URL can be comma-separated
// e.g. "https://your-app.vercel.app,http://localhost:3000"
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
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
