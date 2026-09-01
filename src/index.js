import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './api/users/routes/auth.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import superAdminRoutes from './api/super-admin/routes/superAdmin.routes.js';
import adminRoutes from './api/admin/routes/admin.routes.js';
import productRoutes from './api/products/routes/product.routes.js';
import orderRoutes from "./api/orders/routes/order.routes.js";
import applicationsRoutes from './api/applications/routes/applications.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const NETLIFY_FRONTEND_ORIGIN = 'https://marvelous-nasturtium-ea80af.netlify.app';

const extraOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const normalizeOrigin = (origin) => (origin || '').replace(/\/+$/, '').toLowerCase();

const allowedOrigins = [
  'http://localhost',
  'http://localhost:5000',
  'http://localhost:5500',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5500',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
  'http://0.0.0.0:5000',
  'http://0.0.0.0:5500',
  'http://0.0.0.0:3000',
  'http://0.0.0.0:4173',
  'http://0.0.0.0:5173',
  'http://0.0.0.0:8080',
  NETLIFY_FRONTEND_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.HOST,
  ...extraOrigins,
].filter(Boolean);

const isDevelopment = process.env.NODE_ENV !== 'production';

const isAllowedOrigin = (origin) => {
  if (!origin || origin === 'null') return true;
  const normalized = normalizeOrigin(origin);
  return allowedOrigins.some((allowed) => normalizeOrigin(allowed) === normalized)
    || normalizeOrigin(NETLIFY_FRONTEND_ORIGIN) === normalized
    || /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::\d+)?$/i.test(normalized)
    || /^https?:\/\/(?:192\.168|10|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}(?::\d+)?$/i.test(normalized)
    || /^https?:\/\/[^/]+\.netlify\.app$/i.test(normalized);
};

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    if (isDevelopment || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    console.warn('Blocked CORS origin:', origin);
    callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from root directory (index.html, submitted.html, index.css)
app.use(express.static(rootDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/applications', applicationsRoutes);
app.use("/uploads", express.static("uploads"));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Serve submitted.html
app.get('/submitted.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'submitted.html'));
});

// Error handler middleware (must be after all other middleware)
app.use(errorHandler);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  });
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err); 
  res.status(500).json({
    status: "error",
    message: err.message || "Internal server error"
  });
});

export default app;