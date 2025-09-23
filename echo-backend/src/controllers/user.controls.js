import db from "../models/sequelize.js";
import bcrypt from "bcrypt";
import { userSchema } from "./../schemas/user.schema.js";

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
