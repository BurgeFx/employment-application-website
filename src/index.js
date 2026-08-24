import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import authRoutes from './api/users/routes/auth.routes.js';
import { errorHandler } from './lib/middlewares/errorHandler.js';
import superAdminRoutes from './api/super-admin/routes/superAdmin.routes.js';
import adminRoutes from './api/admin/routes/admin.routes.js';
import productRoutes from './api/products/routes/product.routes.js';
import orderRoutes from "./api/orders/routes/order.routes.js";


const app = express()


app.use(helmet());
app.use(compression());
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(errorHandler);
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/uploads", express.static("uploads"));


//Test routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Success',
    message: 'API is running'
  });
});

//404 Handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  });
});

//Global Error Handler
app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err); // log the error
  res.status(500).json({
    status: "error",
    message: err.message || "Internal server error"
  });
});

export default app;