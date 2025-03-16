import { prisma } from '../src/lib/prisma';
const bcrypt = require('bcryptjs');

async function main() {
  // Clear existing users (only in development)
  await prisma.user.deleteMany();

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@stocksage.com',
      password: hashedPassword,
      role: 'admin',
      businessName: 'StockSage Admin',
    },
  });
  
  console.log('Created admin user:', admin);

  // Create demo user
  const demoUserPassword = await bcrypt.hash('Password123', 10);
  
  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@stocksage.com',
      password: demoUserPassword,
      role: 'user',
      businessName: 'Demo Business',
    },
  });
  
  console.log('Created demo user:', demoUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 