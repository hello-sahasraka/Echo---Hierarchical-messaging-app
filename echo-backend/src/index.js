import express from 'express';
import http from "http";
import { setup_socket } from './socket/socket.js'; 
import verify_jwt from './middlewares/auth.js';
import { initDB } from './database.js';
import cors from 'cors';
// import userRoutes from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
app.use(cors());
const server = http.createServer(app);

//Middleware
app.use(express.json());
app.use(verify_jwt);


//socket.io
setup_socket(server);

//Routes
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);

//Database initialization and start server
initDB()
  .then(() => {
    server.listen(5000, () => {
      console.log(`Server running on http://localhost:5000`);
    });
  })
