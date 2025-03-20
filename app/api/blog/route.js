import prisma from "../../../services/db";
import { NextResponse } from "next/server";
import { verifyToken } from "../../../services/auth";

// Middleware: Extract token from headers
function getTokenFromHeaders(req) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.split(" ")[1]; // Extract token after 'Bearer '
}

// Middleware: Verify JWT and Check Role
async function authenticateUser(req) {
    const token = getTokenFromHeaders(req);
    if (!token) {
        return { error: "Unauthorized! Token missing.", status: 401 };
    }

    let decodedToken;
    try {
        decodedToken = verifyToken(token);
    } catch (error) {
        return { error: "Invalid token!", status: 401 };
    }

    const { user_id } = decodedToken;
    const user = await prisma.user.findUnique({ where: { user_id }, include: { role: true } });

    if (!user || !user.role) {
        return { error: "User or role not found!", status: 404 };
    }

    const roleMatch = await prisma.roles.findUnique({ where: { role_id: user.user_role } });

    if (!roleMatch) {
        return { error: "Role not found in database!", status: 403 };
    }

    if (roleMatch.role_id !== 1 && roleMatch.role_id !== 2) {
        return { error: "Access denied! Only admins can access this.", status: 403 };
    }

    return { user, roleMatch };
}

// POST: Create a Blog (Only Admin & Super Admin)
export async function POST(req) {
    try {
        const authResult = await authenticateUser(req);
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }
        const { user } = authResult;

        const body = await req.json();
        const { blog_content } = body;

        if (!blog_content || !Array.isArray(blog_content)) {
            return NextResponse.json({ error: "Blog content must be an array!" }, { status: 400 });
        }

        // Store blog with content array in the same order
        const newBlog = await prisma.blog.create({
            data: {
                blog_content,  // Directly store the array
                user_id: user.user_id,
                active: true,
            },
        });

        return NextResponse.json({ message: "Blog created successfully!", blog: newBlog, createdBy: user.user_name }, { status: 201 });

    } catch (error) {
        console.error("Error creating blog:", error);
        return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const authResult = await authenticateUser(req);
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(req.url);
        const blogId = searchParams.get("id");

        if (blogId && isNaN(parseInt(blogId))) {
            return NextResponse.json({ error: "Invalid blog ID!" }, { status: 400 });
        }

        let blogs;

        //  Fetch a single blog by ID
        if (blogId) {
            blogs = await prisma.blog.findUnique({
                where: { id: parseInt(blogId) },
                select: {
                    id: true,
                    blog_content: true, //  Blog content JSON
                    active: true,
                    created_at: true,
                    user: {
                        select: { user_name: true } //  Fetch user_name
                    }
                },
            });

            if (!blogs) {
                return NextResponse.json({ error: "Blog not found!" }, { status: 404 });
            }

            //  Remove `user` and keep only `created_by`
            const formattedBlog = {
                id: blogs.id,
                blog_content: blogs.blog_content,
                active: blogs.active,
                created_at: blogs.created_at,
                created_by: blogs.user.user_name //  Rename `user_name` to `created_by`
            };

            return NextResponse.json({ message: "Blog fetched successfully!", blog: formattedBlog }, { status: 200 });

        } else {
            //  Fetch paginated blogs
            const page = parseInt(searchParams.get("page")) || 1;
            const pageSize = parseInt(searchParams.get("pageSize")) || 10;

            blogs = await prisma.blog.findMany({
                select: {
                    id: true,
                    blog_content: true, //  Blog content JSON
                    active: true,
                    created_at: true,
                    user: {
                        select: { user_name: true } //  Fetch user_name
                    }
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { created_at: "desc" },
            });

            //  Format response: Remove `user` and keep `created_by`
            const formattedBlogs = blogs.map(blog => ({
                id: blog.id,
                blog_content: blog.blog_content,
                active: blog.active,
                created_at: blog.created_at,
                created_by: blog.user.user_name //  Rename `user_name` to `created_by`
            }));

            return NextResponse.json({ message: "Blogs fetched successfully!", blogs: formattedBlogs }, { status: 200 });
        }

    } catch (error) {
        console.error("Error fetching blogs:", error);
        return NextResponse.json({ error: "Something went wrong", details: error.message }, { status: 500 });
    }
}
