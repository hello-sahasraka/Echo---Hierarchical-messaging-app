import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../models/sequelize.js";
import { get_chat_list } from "../controllers/chat.controls.js";

dotenv.config();

const User = db.users;
const Message = db.messages;
const Participant = db.participants;
const Chat = db.chats;

const onlineUsers = new Map();

export const setup_socket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    // Middleware to authenticate user
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        // const token = socket.handshake.query.token;

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
        const senderUser = await User.findByPk(userId);

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
            socket.emit("new_undelivered_message", msg.toJSON(), async (ack) => {
                if (ack) {
                    msg.delivered = true;
                    msg.delivered_at = new Date();
                    await msg.save();
                }
            });
        }

        // Handle sending messages
        socket.on("send_message", async ({ chatId, content }, ack) => {
            if (!chatId || !content.trim()) return ack({ ok: false, error: "Invalid input" });

            try {
                const senderId = userId;
                let participants = [];

                const participant = await Participant.findOne({
                    where: { chat_id: chatId, user_id: senderId },
                });

                if (!participant) {
                    return ack({ ok: false, error: "Not a participant in this chat" });
                }

                await Chat.update(
                    { last_message: content.trim() },
                    { where: { id: chatId } }
                );

                if (participant.role === "creator") {
                    participants = await Participant.findAll({ where: { chat_id: chatId } });
                } else {
                    participants = await Participant.findAll({ where: { chat_id: chatId, role: "creator" } });
                }

                for (const p of participants) {
                    if (String(p.user_id) === String(senderId)) continue;


                    console.log("Debug, before saving the message: ", senderId);
                    const msg = await Message.create({
                        chat_id: chatId,
                        sender_id: senderId,
                        recipient_id: p.user_id,
                        content: content.trim(),
                        delivered: false,
                    });

                    const payload = {
                        ...msg.toJSON(),
                        sender: { id: senderId, name: senderUser?.name || `User ${senderId}` },
                    };

                    const sockets = onlineUsers.get(String(p.user_id));

                    if (sockets && sockets.size > 0) {
                        for (const sid of sockets) {
                            io.to(sid).emit("new_message", payload, async (ack2) => {
                                if (ack2) {
                                    console.log("Debug: Message delivered", msg.id);
                                    msg.delivered = true;
                                    msg.delivered_at = new Date();
                                    await msg.save();
                                }
                            });
                        }
                    }
                }

                ack({ ok: true, error: "None" });
            } catch (err) {
                console.error("send_message error:", err);
                ack({ ok: false, error: err.message });
            }
        });

        // Mark messages as read
        socket.on("mark_read", async ({ chatId }, ack) => {
            if (!chatId) {
                return ack({ ok: false, error: "Invalid chatId" });
            }

            if (!userId) {
                return ack({ ok: false, error: "User not authenticated" });
            }

            try {
                // Perform update and get count
                const [updatedCount] = await Message.update(
                    { isRead: true },
                    {
                        where: {
                            chat_id: chatId,
                            recipient_id: userId,
                            isRead: false
                        }
                    }
                );

                console.log("Rows updated:", updatedCount);


                if (updatedCount > 0) {
                    const participants = await Participant.findAll({
                        where: { chat_id: chatId },
                        attributes: ['user_id']
                    });

                    for (const p of participants) {
                        if (String(p.user_id) === String(userId)) continue; 

                        const sockets = onlineUsers.get(String(p.user_id));
                        if (sockets) {
                            for (const sid of sockets) {      
                                io.to(sid).emit("messages_read", {
                                    chatId,
                                    readBy: userId
                                });
                            }
                        }
                    }
                }


                ack({ ok: true, updatedCount });
            } catch (err) {
                console.error("mark_read error:", err);
                ack({ ok: false, error: err.message });
            }
        });

        //Get all chats
        socket.on("get_all_chats", async (ack) => {
            try {
                const chats = await get_chat_list(userId)

                ack({ ok: true, chats });
            } catch (err) {
                console.error("get_chat_list error:", err);
                ack({ ok: false });
            }
        })

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
