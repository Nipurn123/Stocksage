import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.$transaction([
    prisma.dashboardData.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.purchaseOrder.deleteMany(),
    prisma.supplier.deleteMany(),
    prisma.inventoryLog.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.daybookEntry.deleteMany(),
    prisma.daybookTag.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  
  // Create users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@stocksage.com',
      password: await hash('admin123', 10),
      role: 'ADMIN',
      name: 'Admin User',
      businessName: 'Stocksage Admin',
    },
  });
  
  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        userId: adminUser.id,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Office Supplies',
        description: 'Office and stationery items',
        userId: adminUser.id,
      },
    }),
  ]);
  
  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Laptop Pro X',
        description: 'High-performance laptop',
        sku: 'LAPTOP-X-001',
        barcode: 'LAPTOP-X-001-BARCODE',
        price: 999.99,
        cost: 800.00,
        currentStock: 50,
        minStockLevel: 10,
        maxStockLevel: 100,
        reorderPoint: 15,
        reorderQuantity: 20,
        location: 'Warehouse A',
        categoryId: categories[0].id,
        userId: adminUser.id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Office Chair Deluxe',
        description: 'Ergonomic office chair',
        sku: 'CHAIR-D-001',
        barcode: 'CHAIR-D-001-BARCODE',
        price: 299.99,
        cost: 200.00,
        currentStock: 30,
        minStockLevel: 5,
        maxStockLevel: 50,
        reorderPoint: 8,
        reorderQuantity: 10,
        location: 'Warehouse B',
        categoryId: categories[1].id,
        userId: adminUser.id,
      },
    }),
  ]);
  
  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Tech Solutions Inc',
        email: 'contact@techsolutions.com',
        phone: '+1122334455',
        address: '789 Tech St, Tech City',
        userId: adminUser.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Office Plus',
        email: 'sales@officeplus.com',
        phone: '+5544332211',
        address: '321 Office Ave, Office City',
        userId: adminUser.id,
      },
    }),
  ]);

  // Create suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'Global Electronics',
        email: 'supply@globalelectronics.com',
        phone: '+9988776655',
        address: '456 Supply St, Supply City',
        userId: adminUser.id,
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Office Supplies Co',
        email: 'orders@officesupplies.com',
        phone: '+1122334455',
        address: '789 Supply Ave, Supply City',
        userId: adminUser.id,
      },
    }),
  ]);
  
  // Create purchase orders
  await prisma.purchaseOrder.create({
    data: {
      orderNumber: 'PO-001',
      supplierId: suppliers[0].id,
      orderDate: new Date(),
      expectedDate: new Date('2024-04-24'),
      status: 'PENDING',
      total: 40000.00,
      tax: 3200.00,
      shipping: 500.00,
      notes: 'Please expedite shipping',
      userId: adminUser.id,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 50,
            unitPrice: 800.00,
            total: 40000.00,
          },
        ],
      },
    },
  });
  
  // Create invoices
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-001',
      customerId: customers[0].id,
      date: new Date(),
      totalAmount: 999.99,
      status: 'PAID',
      dueDate: new Date('2024-04-24'),
      userId: adminUser.id,
      items: {
        create: [
          {
            description: products[0].name,
            quantity: 1,
            unitPrice: 999.99,
            amount: 999.99,
            productSku: products[0].sku,
            taxRate: 8.5,
            taxAmount: 84.99,
          },
        ],
      },
    },
  });
  
  // Create inventory logs
  await prisma.inventoryLog.create({
    data: {
      productId: products[0].id,
      quantity: 50,
      quantityBefore: 0,
      quantityAfter: 50,
      type: 'addition',
      reason: 'Initial stock',
      createdBy: adminUser.id,
      cost: 800.00,
    },
  });

  // Create daybook entries
  await Promise.all([
    prisma.daybookEntry.create({
    data: {
        title: 'Sale of Laptop Pro X',
        content: 'Sold 1 unit of Laptop Pro X to Tech Solutions Inc',
        date: new Date(),
        userId: adminUser.id,
        tags: {
          create: [
            {
              name: 'sales',
              userId: adminUser.id,
            },
          ],
        },
      },
    }),
    prisma.daybookEntry.create({
      data: {
        title: 'Purchase Order Created',
        content: 'Created purchase order for 50 units of Laptop Pro X',
        date: new Date(),
        userId: adminUser.id,
        tags: {
          create: [
            {
              name: 'purchase',
              userId: adminUser.id,
            },
          ],
        },
      },
    }),
  ]);

  // Create dashboard data
  await prisma.dashboardData.create({
    data: {
      userId: adminUser.id,
      totalSales: 999.99,
      totalProducts: 2,
      lowStockItems: 0,
      outOfStockItems: 0,
      salesSummary: JSON.stringify({
        today: 999.99,
        week: 999.99,
        month: 999.99,
        trend: [999.99],
      }),
      recentActivities: JSON.stringify([
        {
          type: 'sale',
          description: 'Sold Laptop Pro X',
          amount: 999.99,
          date: new Date(),
        },
      ]),
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });