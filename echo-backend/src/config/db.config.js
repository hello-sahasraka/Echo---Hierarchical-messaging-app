import dotenv from "dotenv";

dotenv.config();

export default {
    HOST: "localhost",
    USER: "postgres",
    PASSWORD: process.env.DATABASE_PASSWORD,
    DB: "echodb",
    dialect: "postgres",
    PORT: 5432,
    // pool: {
    //     max: 5,
    //     min: 0,
    //     acquire: 30000,
    //     idle: 10000,
    // },
};