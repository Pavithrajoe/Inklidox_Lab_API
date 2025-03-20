/*
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("Error: JWT_SECRET is missing in .env file!");
    process.exit(1);
}

// Function to Generate JWT Token
export function generateToken(user) {
    if (!user.user_id || !user.role.role_name) {
        throw new Error("User ID or Role is missing");
    }

    console.log("Generating token for:", user.user_id, user.role.role_name); // Debugging

    return jwt.sign(
        { user_id: user.user_id, role: user.role.role_name }, // Ensure role_name is used
        JWT_SECRET,
        { expiresIn: "1h" } 
    );
}

// Function to Verify JWT Token
export function verifyToken(token) {
    if (!token) {
        throw new Error("Token is required");
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded Token:", decoded); // Debugging
        return decoded;
    } catch (error) {
        throw new Error("Invalid token");
    }
}

export { JWT_SECRET };

*/

// above code is for common, below code is for specific roles (just for checking use above code)

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("Error: JWT_SECRET is missing in .env file!");
    process.exit(1);
}

// Function to Generate JWT Token
export function generateToken(user) {
    return jwt.sign(
        {
            user_id: user.user_id,
            role: user.role || "user" // Ensure role is defined
        },
        JWT_SECRET,
        { expiresIn: "1h" }
    );
}

// Function to Verify JWT Token
export function verifyToken(token) {
    if (!token) {
        throw new Error("Token is required");
    }

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid token");
    }
}

export { JWT_SECRET };
