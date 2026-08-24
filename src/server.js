import "./config/env.js";
import app from './index.js';
import { db } from './config/db/index.js';
import transporter from './config/email/index.js';


const port = process.env.PORT;
const host = process.env.HOST

//Email Config
try {
  transporter.verify((error, success) => {
    if (error) {
      // Log the error to the console
      console.error("Email server verification failed:", error);
    } else {
      console.log("Email server is ready to send messages");
    }
  });
} catch (err) {
  console.error("Email server failed to initialize:", err);
}

//Database connection
db.connect()
  .then(obj => {
    console.log('Database connected');
    obj.done();
  })
  .catch(error => {
    console.error('Database connection failed:', error.message);
  });

//App.listen (What app.listen does 1. Starts the HTTP server 2. Listens for incoming requests 3. Keeps the app running)
app.listen(port, () => {
  console.log(`Server is running on port: ${host}:${port}`)
});
