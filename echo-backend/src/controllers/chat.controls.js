import db from "../models/sequelize.js";

const Chat = db.chats;
const Participant = db.participants;

export const create_chat = async (userId, subordinateIds) => {
    const exsisting = await Chat.findOne({
        where: {creator_id : userId}
    })

    if (exsisting) throw new Error("You must delete the existing chat first") 
        
    const chat = await Chat.create({creator_id: userId, })

    await Participant.bulkCreate([
        {chat_id: chat.id, user_id: userId, role: "creator"},
        ...subordinateIds.map((id) => ({chat_id: chat.id, user_id: id, role: "subordinater"}))
    ])
}