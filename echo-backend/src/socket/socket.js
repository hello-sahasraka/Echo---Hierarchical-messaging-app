import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../models/sequelize.js";
import { get_subordinates } from "../controllers/user.controls.js";

dotenv.config();

const Message = db.messages;
const onlineUsers = new Map();

export const setup_socket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    // Middleware to authenticate user
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("No token"));

        try {
            const payload = jwt.verify(token, process.env.JWT_KEY);
            socket.data.userId = String(payload.id);
            next();
        } catch (err) {
            next(new Error("Invalid token"));
        }
    });

    // On connection
    io.on("connection", async (socket) => {
        const userId = socket.data.userId;
        console.log(`User ${userId} connected with socket ${socket.id}`);

        // Track online users
        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId).add(socket.id);

        // Get undelivered messages
        const undelivered = await Message.findAll({
            where: { recipient_id: userId, delivered: false }
        });

        // Send undelivered messages
        for (const msg of undelivered) {
            socket.emit("new_messages", msg.toJSON(), async (ack) => {
                if (ack) {
                    msg.delivered = true;
                    msg.delivered_at = new Date();
                    await msg.save();
                }
            });
        }

        // Handle sending messages
        socket.on("send_message", async ({ content }, ack) => {
            if (!content || !content.trim()) return ack({ ok: false });

            try {
                const subordinates = get_subordinates();

                for (const sub of subordinates) {
                    const msg = await Message.create({
                        sender_id: userId,
                        recipient_id: sub.id,
                        content,
                        delivered: false
                    });

                    const sockets = onlineUsers.get(String(sub.id));

                    if (sockets && sockets.size > 0) {
                        for (const sid of sockets) {
                            io.to(sid).emit("new_message", msg.toJSON(), async (ack2) => {
                                if (ack2) {
                                    msg.delivered = true;
                                    msg.delivered_at = new Date();
                                    await msg.save();
                                }
                            });
                        }
                    }
                }

                ack({ ok: true });
            } catch {
                ack({ ok: false });
            }
        });

        // On disconnect
        socket.on("disconnect", () => {
            console.log(`User ${userId} disconnected socket ${socket.id}`);
            const sockets = onlineUsers.get(userId);
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) onlineUsers.delete(userId);
            }
        });
    });

    return io;
};
