import jwt from "jsonwebtoken";
import db from "../models/sequelize.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { userSchema } from "./../schemas/user.schema.js";

dotenv.config();

const Op = db.Sequelize.Op;
const User = db.users;

// Create and Save a new User
export const create_user = (req, res) => {
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
            {id: user.id, role: user.role},
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
