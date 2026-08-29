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
const allowedOrigins = [
  'http://localhost',
  'http://localhost:5000',
  'http://localhost:5500',
  'http://127.0.0.1',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5500',
  'http://0.0.0.0:5000',
  'http://0.0.0.0:5500',
  process.env.HOST,
].filter(Boolean);

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.options(/.*/, (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});
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