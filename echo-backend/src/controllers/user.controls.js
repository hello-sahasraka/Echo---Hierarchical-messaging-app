import jwt from "jsonwebtoken";
import db from "../models/sequelize.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { userSchema } from "./../schemas/user.schema.js";
import { where } from "sequelize";
// import { Sequelize } from "sequelize";

dotenv.config();

const User = db.users;

// Create and Save a new User
export const create_user = (req, res) => {

    if (!req.user) {
        res.status(401).json({
            message: "You are not authorized"
        })

        return;
    }

    const userData = req.body;
    const validated = userSchema.safeParse(userData);

    if (!validated.success) {
        return res.status(400).json({
            errors: validated.error.flatten(),
            message: "Validation failed"
        });
    }


    // Hash the password
    const hashedPassword = bcrypt.hashSync(userData.password, 10);

    // Create a User
    const user = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        parent_id: userData.parent_id,
    };

    // Save User in the database
    User.create(user)
        .then((data) => {
            res.json({
                message: "User created successfully",
                user: data
            });
        })
        .catch((err) => {
            res.status(500).json({
                message:
                    err.message || "Some error occurred while creating the User.",
            });
        });
};

export const user_login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        //Check user
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        //Check password
        const valid_password = bcrypt.compareSync(password, user.password)

        if (!valid_password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        //Generate JWT key
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_KEY,
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                parent_id: user.parent_id
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Some error occurred while logging in.",
        });
    }
}

export const get_all_users = async (req, res) => {

    try {
        const users = await User.findAll({
            attributes: ["id", "name", "email", "role", "parent_id"],
        });

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json({
            message: "Users fetched successfully",
            users
        })

    } catch (err) {
        res.status(500).json({
            message: err.message || "Some error occurred while fetching users.",
        });
    }
}

export const get_user_by_id = async (userId) => {
  try {
    const user = await User.findOne({
      where: { id: userId },
    });

    return user; 
  } catch (err) {
    console.error("Error fetching user:", err);
    throw err;
  }
};


export const get_subordinates = async (user_id) => {
    // const { user_id } = req.params
    //Query
    const query = `
     WITH RECURSIVE subordinates AS (
      SELECT id, name, parent_id
      FROM users
      WHERE parent_id = :user_id

      UNION ALL

      SELECT u.id, u.name, u.parent_id
      FROM users u
      INNER JOIN subordinates s ON u.parent_id = s.id
        )
        SELECT * FROM subordinates;`

    try {
        //Execute query
        const subordinates = await db.sequelize.query(query, {

            replacements: { user_id }, // safe parameter binding
            type: db.Sequelize.QueryTypes.SELECT
        })

        console.log("subordinates:", subordinates);

        return subordinates;
        // res.json({
        //     message: "Subordinates fetched successfully",
        //     subordinates: subordinates
        // });

    } catch (err) {
        res.status(500).json({
            message: err.message || "Error fetching subordinates."
        });
    }
}

export const delete_user = async (req, res) => {
    const { user_id } = req.params;

    if (!req.user) {
        res.status(401).json({
            message: "You are not authorized"
        })

        return;
    }

    try {
        await User.destroy({
            where: {
                id: user_id
            }
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || "Error deleting user."
        });
    }
}