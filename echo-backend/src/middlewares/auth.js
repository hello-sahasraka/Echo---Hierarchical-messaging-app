import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function verify_jwt(req, res, next) {
    const header = req.header("Authorization");
    if (header != null) {
        const token = header.replace("Bearer ", "");
        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (decoded != null) {
                console.log(decoded);
                if (err) {
                    console.log(err);
                }
                req.user = decoded;
            }
        })
    }
    next();
}