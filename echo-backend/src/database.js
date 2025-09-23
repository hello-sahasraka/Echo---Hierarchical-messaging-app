import db from "./models/sequelize.js";

export async function initDB() {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected successfully.");

    await db.sequelize.sync({ alter: true });
    console.log("All models were synchronized.");
  } catch (err) {
    console.error("Database initialization failed:");
  }
}
