import express from 'express';
import { initDB } from './database.js';
import userRoutes from './routes/userRoutes.js';

const app = express();


app.use(express.json());

app.use("/api/createuser", userRoutes);


initDB()
  .then(() => {
    app.listen(3000, () => {
      console.log(`Server running on http://localhost:3000`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize database:");
  });
