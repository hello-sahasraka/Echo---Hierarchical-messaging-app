import Sequelize from "sequelize";
import dbConfig from "../config/db.config.js";
import User from "./user.model.js";
import Message from "./message.model.js";

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

export default db;