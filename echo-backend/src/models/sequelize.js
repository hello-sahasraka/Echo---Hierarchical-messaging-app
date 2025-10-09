import Sequelize from "sequelize";
import dbConfig from "../config/db.config.js";
import User from "./user.model.js";
import Message from "./message.model.js";
import Chat from "./chat.model.js";
import Participant from "./chatParticipants.model.js";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    port: dbConfig.PORT,
});

 
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Initialized models
db.users = User(sequelize, Sequelize);
db.messages = Message(sequelize, Sequelize);
db.chats = Chat(sequelize, Sequelize);
db.participants = Participant(sequelize, Sequelize);

// Define associations
// Chat → Messages
db.chats.hasMany(db.messages, { foreignKey: "chat_id", as: "messages" });
db.messages.belongsTo(db.chats, { foreignKey: "chat_id", as: "chat" });

db.chats.belongsTo(db.users, { foreignKey: "creator_id", as: "creator" });
db.users.hasMany(db.chats, { foreignKey: "creator_id", as: "createdChats" });

db.messages.belongsTo(db.users, { foreignKey: "sender_id", as: "sender" });
db.users.hasMany(db.messages, { foreignKey: "sender_id", as: "sentMessages" });

export default db;