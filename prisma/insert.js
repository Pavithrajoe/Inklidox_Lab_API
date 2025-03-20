import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt'; // Hash passwords

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Insert Roles
    await prisma.roles.createMany({
        data: [
            { role_id: 1, role_name: "super_admin" },
            { role_id: 2, role_name: "admin" },
            { role_id: 3, role_name: "user" }
        ],
        skipDuplicates: true,
    });
    console.log(" Roles inserted!");

    // Insert Company Master
    await prisma.companyMaster.createMany({
        data: [
            { company_id: 101, company_name: "InkliDox Technologies", contact_email: "Inklidox@gmail.com", contact_number: "95004 11617", address: "Coimbatore" }
        ],
        skipDuplicates: true,
    });
    console.log(" Companies inserted!");

    // Hash password before storing
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Insert Users
    await prisma.user.createMany({
        data: [
            { user_id: 1, company_id: 101, user_name: "Pavithra", employee_id: 2016, user_email: "pavithra@gmail.com", user_password: hashedPassword, user_role: 1, is_active: true },
            { user_id: 2, company_id: 101, user_name: "Gaythri", employee_id: 2018, user_email: "gayathri@gmail.com", user_password: hashedPassword, user_role: 2, is_active: true },
            { user_id: 3, company_id: 101, user_name: "Vignesh", employee_id: 2020, user_email: "vignesh@gmail.com", user_password: hashedPassword, user_role: 3, is_active: true }
        ],
        skipDuplicates: true,
    });
    console.log(" Users inserted!");

    // Insert Subscribers
    await prisma.subscriberManagement.createMany({
        data: [
            { subscriber_email: "subscriber1@gmail.com", company_id: 101, is_active: true },
            { subscriber_email: "subscriber2@gmail.com", company_id: 101, is_active: true }
        ],
        skipDuplicates: true,
    });
    console.log(" Subscribers inserted!");

    console.log("🎉 Seeding completed!");
}

main()
    .catch((e) => {
        console.error(" Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
