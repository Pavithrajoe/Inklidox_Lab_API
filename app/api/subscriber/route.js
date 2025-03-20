/*

import { NextResponse } from "next/server";
import prisma from "../../../services/db"; 
import { generateToken, verifyToken } from "../../../services/auth.js";
import { z } from "zod"; 

//  Define Zod schema for email validation
const emailSchema = z.object({
    email: z.string().email({ message: "Invalid email format" })  
});

//  POST Method: Add a new subscriber
export async function POST(req) {
    try {
        const body = await req.json();

        //  Validate email
        const validation = emailSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
        }

        //  Check if email already exists
        const existingSubscriber = await prisma.subscriberManagement.findUnique({
            where: { subscriber_email: body.email },
        });

        if (existingSubscriber) {
            return NextResponse.json({ error: "Email already subscribed!" }, { status: 409 });
        }

        //  Store email in the database
        await prisma.subscriberManagement.create({
            data: { 
                subscriber_email: body.email,
            },
        });

        return NextResponse.json({ message: "Email stored successfully!" }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
    }
}

//  GET Method: Retrieve all subscribers & Generate Token for Admin/Super Admin
export async function GET() {
    try {
        //  Find an admin or super_admin user
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ user_role: 1 }, { user_role: 2 }], // 1 = super_admin, 2 = admin
            },
            include: { role: true }, // Fetch role details
        });

        if (!user) {
            return NextResponse.json({ error: "No admin or super_admin found" }, { status: 404 });
        }

        //  Automatically generate JWT token
        const token = generateToken({ userId: user.user_id, role: user.role.role_name });
        

        //  Fetch all subscribers from the database
        const subscribers = await prisma.subscriberManagement.findMany();

        return NextResponse.json({ 
            message: "Token generated successfully!", 
            token, 
            subscribers // Return subscribers along with the token
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
    }
}

*/

import { NextResponse } from "next/server";
import prisma from "../../../services/db"; 
import { generateToken, verifyToken } from "../../../services/auth.js";
import { z } from "zod"; 

// Define Zod schema for email validation
const emailSchema = z.object({
    email: z.string().email({ message: "Invalid email format" })
});

// POST Method: Add a new subscriber
export async function POST(req) {
    try {
        const body = await req.json();

        // Validate email
        const validation = emailSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
        }

        // Check if email already exists
        const existingSubscriber = await prisma.subscriberManagement.findUnique({
            where: { subscriber_email: body.email },
        });

        if (existingSubscriber) {
            return NextResponse.json({ error: "Email already subscribed!" }, { status: 409 });
        }

        // Store email in the database
        await prisma.subscriberManagement.create({
            data: { 
                subscriber_email: body.email,
            },
        });

        return NextResponse.json({ message: "Email stored successfully! subscribed!! " }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
    }
}

// Middleware function to extract token from headers
function getTokenFromHeaders(req) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.split(" ")[1]; // Extract token after 'Bearer '
}


// GET Method: Retrieve all subscribers & Generate Token for Admin/Super Admin
export async function GET(req) {
    try {
        // Extract token from request headers
        const token = getTokenFromHeaders(req);
        if (!token) {
            return NextResponse.json({ error: "Unauthorized! Token missing." }, { status: 401 });
        }

        // Verify token and extract user_id, role
        let decodedToken;
        try {
            decodedToken = verifyToken(token);
        } catch (error) {
            return NextResponse.json({ error: "Invalid token!" }, { status: 401 });
        }

        const { user_id, role } = decodedToken;

        // Check if the user exists in the database
        const user = await prisma.user.findUnique({
            where: { user_id: user_id },
            include: { role: true }, // Fetch role details
        });

        if (!user || !user.role) {
            return NextResponse.json({ error: "User or role not found!" }, { status: 404 });
        }

        // Check if the role from JWT matches the role_id in the Roles table
        const roleMatch = await prisma.roles.findUnique({
            where: { role_id: user.user_role }, // Compare user_role with role_id in Roles table
        });

        if (!roleMatch) {
            return NextResponse.json({ error: "Role not found in Roles table!" }, { status: 403 });
        }

        // **New Condition: Only allow super_admin (1) and admin (2)**
        if (roleMatch.role_id !== 1 && roleMatch.role_id !== 2) {
            return NextResponse.json({ error: "Access denied! Only admins can fetch subscribers." }, { status: 403 });
        }

        // Fetch subscriber list (only if user is super_admin or admin)
        const subscribers = await prisma.subscriberManagement.findMany();

        return NextResponse.json({
            message: "Subscriber list fetched successfully!",
            user_id,
            role: roleMatch.role_name, // Return role from database
            subscribers,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
    }
}
