import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const users = [
  { username: "developer", name: "Developer", role: "ADMIN" },
  { username: "mp", name: "mp", role: "USER" },
  { username: "lm", name: "lm", role: "USER" },
  { username: "ar", name: "ar", role: "USER" },
  { username: "pr", name: "pr", role: "USER" },
  { username: "er", name: "er", role: "USER" },
  { username: "md", name: "md", role: "USER" },
  { username: "ss", name: "ss", role: "USER" },
  { username: "secretary", name: "Secretary", role: "USER" },
  { username: "gr1", name: "gr1", role: "USER" },
  { username: "gr2", name: "gr2", role: "USER" },
  { username: "nk", name: "nk", role: "USER" },
];

async function main() {
  console.log("Seeding users...");
  const defaultPassword = await bcrypt.hash("password123", 10);

  for (const u of users) {
    const email = `${u.username}@company.com`;
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: email,
          name: u.name,
          password: defaultPassword,
          role: u.role
        }
      });
      console.log(`Created user: ${u.username}`);
    } else {
      console.log(`User already exists: ${u.username}`);
    }
  }
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
