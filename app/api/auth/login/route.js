import { NextResponse } from "next/server";
import prisma from "../../../../services/db"; // Adjust path if needed
import { generateToken } from "../../../../services/auth";
import bcrypt from "bcrypt";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // Check if user exists in DB
        const user = await prisma.user.findUnique({
            where: { user_email: email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found!" }, { status: 404 });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.user_password);
        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid password!" }, { status: 401 });
        }

        // Generate JWT token
        const token = generateToken({ user_id: user.user_id, role: user.user_role });

        return NextResponse.json({ message: "Login successful!", token }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
    }
}
