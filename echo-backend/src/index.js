import express from 'express';
import verify_jwt from './middlewares/auth.js';
import { initDB } from './database.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

//Middleware
app.use(express.json());
app.use(verify_jwt);

//Routes
app.use("/api/user", userRoutes);

//Database initialization and start server
initDB()
  .then(() => {
    app.listen(3000, () => {
      console.log(`Server running on http://localhost:3000`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize database:");
  });
