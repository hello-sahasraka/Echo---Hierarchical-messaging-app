import db from "../models/sequelize.js";
import { get_subordinates, get_user_by_id } from "./user.controls.js";

const Chat = db.chats;
const Participant = db.participants;
const Message = db.messages;
const User = db.users;

export const create_chat = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await get_user_by_id(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const subordinates = await get_subordinates(userId);
        if (!subordinates || subordinates.length === 0) {
            return res.status(400).json({ message: "No subordinates found" });
        }

        const existing = await Chat.findOne({ where: { creator_id: userId } });

        if (existing) {
            return res.status(400).json({ message: "You must delete the existing chat first" });
        }

        const chat = await Chat.create({ creator_id: userId });

        // Remove duplicate subordinates by unique user_id
        const uniqueSubs = [
            ...new Map(subordinates.map(sub => [sub.id, sub])).values()
        ];


        // Prepare participant list
        const participants = [
            { chat_id: chat.id, user_id: userId, role: "creator", joined_at: new Date() },
            ...uniqueSubs.map(sub => ({
                chat_id: chat.id,
                user_id: sub.id,
                role: "subordinate",
                joined_at: new Date(),
            })),
        ];

        // Insert participants
        await Participant.bulkCreate(participants);

        // Respond with success
        res.status(201).json({
            message: "Chat created successfully.",
            chat,
            participants,
        });

    } catch (err) {
        console.error("Error creating chat:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

export const get_chat_list = async (userId) => {
    console.log("UserID:", userId);

    try {
        const chats = await Chat.findAll({
            include: [
                {
                    model: Participant,
                    as: "participants",
                    attributes: ["user_id"],
                    where: { user_id: userId }
                },
                {
                    model: Message,
                    as: "messages",
                    include: [
                        {
                            model: User,
                            as: "sender",
                            attributes: ["id", "name"]
                        }
                    ],
                    order: [["createdAt", "DESC"]],
                },
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name"]
                }
            ],
            order: [["id", "DESC"]],
            distinct: true 
        });

        
        const chatList = chats.map(chat => {
            const uniqueMessages = [];
            const seen = new Set();

            for (const msg of chat.messages) {
                const key = `${msg.content}-${msg.sender_id}-${msg.createdAt}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueMessages.push(msg);
                }
            }

            // keep your format exactly the same
            let participantName = chat.creator.id === userId ? "You" : chat.creator.name;
            const lastMessage = uniqueMessages.length
                ? uniqueMessages[uniqueMessages.length - 1].content
                : "";

            return {
                id: chat.id,
                name: participantName,
                lastMessage,
                messages: uniqueMessages
            };
        });

        return chatList;
    } catch (err) {
        console.error("Error fetching chat list:", err);
        throw err;
    }
};

