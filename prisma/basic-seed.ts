const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting basic database seed...');
  
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
  
  console.log('Created admin user:', admin.email);

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
  
  console.log('Created demo user:', demoUser.email);
  
  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 