import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { auth } from '@clerk/nextjs/server';

// Add this for Vercel build compatibility
export const dynamic = 'force-dynamic';

// Function to get the user ID from either Clerk or NextAuth or Authorization header
async function getUserId(request: Request): Promise<string | null> {
  // First try Clerk
  try {
    const { userId } = auth();
    if (userId) return userId;
  } catch (error) {
    console.error('Error with Clerk auth:', error);
  }
  
  // Then try NextAuth
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;
  } catch (error) {
    console.error('Error with NextAuth:', error);
  }
  
  // Finally, try to extract from Authorization header (for client-side auth)
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // This is simplified - in a real app you'd want to verify this token
    // For now we'll just assume that if a token is provided, it's valid
    return 'authenticated-user';
  }
  
  return null;
}

function generateMockProducts(count: number, userId: string) {
  const products = [];
  
  const categories = ['Sarees', 'Handloom Fabric', 'Ready-to-wear', 'Accessories', 'Yarn'];
  
  // MSME business name
  const businessName = 'WeaveMitra';
  
  // Location data for WeaveMitra - a handloom cooperative in Karnataka
  const locations = ['Main Workshop', 'Showroom', 'Village Artisan Center', 'Storage Facility'];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const currentStock = Math.floor(Math.random() * 30) + 5; // Ensuring some minimum stock
    const minStockLevel = Math.max(3, Math.floor(currentStock * 0.2)); // Realistic reorder level
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    let name, sku, price, cost, description;
    
    switch (category) {
      case 'Sarees':
        name = ['Mysore Silk Saree', 'Karnataka Cotton Ikat Saree', 'Ilkal Saree', 'Molakalmuru Saree', 'Dharwad Kasuti Saree'][Math.floor(Math.random() * 5)];
        sku = `${businessName}-SAR-${100 + i}`;
        price = 2500 + Math.floor(Math.random() * 7500); // Higher quality products
        cost = Math.floor(price * 0.65); // 35% margin
        description = `Traditional handwoven ${name.toLowerCase()} crafted by WeaveMitra artisans using age-old techniques`;
        break;
      case 'Handloom Fabric':
        name = ['Karnataka Khadi', 'Udupi Cotton', 'Ilkal Fabric', 'Lambani Embroidery Fabric', 'Coorg Organic Cotton'][Math.floor(Math.random() * 5)];
        sku = `${businessName}-FAB-${100 + i}`;
        price = 450 + Math.floor(Math.random() * 950);
        cost = Math.floor(price * 0.6);
        description = `Premium ${name.toLowerCase()} handwoven by WeaveMitra cooperative artisans (per meter)`;
        break;
      case 'Ready-to-wear':
        name = ['Khadi Kurta', 'Ilkal Cotton Dress', 'Kalamkari Blouse', 'Lambani Embroidered Top', 'Handloom Shirt'][Math.floor(Math.random() * 5)];
        sku = `${businessName}-RTW-${100 + i}`;
        price = 950 + Math.floor(Math.random() * 1950);
        cost = Math.floor(price * 0.65);
        description = `Ethically produced ${name.toLowerCase()} made from WeaveMitra handloom textiles`;
        break;
      case 'Accessories':
        name = ['Kasuti Embroidered Clutch', 'Lambani Embellished Bag', 'Ilkal Stole', 'Khadi Wallet', 'Handloom Jewelry Pouch'][Math.floor(Math.random() * 5)];
        sku = `${businessName}-ACC-${100 + i}`;
        price = 350 + Math.floor(Math.random() * 1150);
        cost = Math.floor(price * 0.55);
        description = `Artisan-crafted ${name.toLowerCase()} made by WeaveMitra cooperative women`;
        break;
      default: // Yarn
        name = ['Organic Karnataka Cotton Yarn', 'Natural Dyed Wool', 'Banana Fiber', 'Recycled Silk Yarn', 'Bamboo Blend Yarn'][Math.floor(Math.random() * 5)];
        sku = `${businessName}-YRN-${100 + i}`;
        price = 220 + Math.floor(Math.random() * 780);
        cost = Math.floor(price * 0.55);
        description = `Sustainably sourced ${name.toLowerCase()} for handloom weaving by WeaveMitra artisans`;
    }
    
    products.push({
      name,
      description,
      sku,
      price,
      cost,
      currentStock,
      minStockLevel,
      category,
      location,
      userId
    });
  }
  
  return products;
}

export async function POST(request: Request) {
  try {
    // Get user ID from various auth methods
    const userId = await getUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const count = data.count || 10; // Default to 10 items
    
    // Generate mock products
    const mockProducts = generateMockProducts(count, userId);
    
    // Create the products in the database
    const products = await Promise.all(
      mockProducts.map(async (product) => {
        // Create product
        const newProduct = await prisma.product.create({
          data: product
        });
        
        // Create inventory log entry for initial stock
        if (product.currentStock > 0) {
          await prisma.inventoryLog.create({
            data: {
              productId: newProduct.id,
              quantity: product.currentStock,
              quantityChange: product.currentStock,
              type: 'in',
              reference: 'Initial Stock',
              notes: 'Dummy data initial inventory',
              createdBy: userId,
            },
          });
        }
        
        return newProduct;
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `${products.length} dummy products added successfully`,
      count: products.length 
    });
  } catch (error) {
    console.error('Error adding dummy products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add dummy products' },
      { status: 500 }
    );
  }
} 