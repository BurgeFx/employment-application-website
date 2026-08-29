import "./config/env.js";
import app from './index.js';
import { db } from './config/db/index.js';
import transporter from './config/email/index.js';

const port = process.env.PORT || 5000;
const host = process.env.HOST || 'http://localhost';

// Email Config is initialized in src/config/email/index.js

// Database connection test (non-blocking)
db.one('SELECT 1')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch(error => {
    console.warn('Database connection warning:', error.message);
    console.warn('Server will continue running, but database operations may fail');
  });

// App.listen (What app.listen does 1. Starts the HTTP server 2. Listens for incoming requests 3. Keeps the app running)
app.listen(port, () => {
  console.log(`Server is running on ${host}:${port}`)
});
