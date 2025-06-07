import { NextRequest, NextResponse } from 'next/server';

// Helper function to format dates (to avoid serialization issues)
const formatDate = (date: Date) => date.toISOString();

// Store entries in memory for the session (will reset on server restart)
let mockEntries = initializeMockEntries();

// Initialize mock entries
function initializeMockEntries() {
  // Get current date info for creating relative dates
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  // Create mock data with a variety of dates and tags relevant to WeaveMitra
  return [
    {
      id: '1',
      title: 'Handloom Inventory Audit Completed',
      content: 'Completed quarterly inventory audit of our handloom products. Found 3 discrepancies: 2 Mysore Silk Sarees not properly recorded, excess Udupi Cotton in storage, and some Lambani embroidery supplies showing wear and tear.',
      date: formatDate(today),
      tags: ['inventory', 'audit', 'quarterly']
    },
    {
      id: '2',
      title: 'Client Meeting - Ethnic Retail Store',
      content: 'Met with Ethnic Retail Store to discuss their upcoming seasonal order. They want to increase their saree order by 20% and are interested in our new Kalamkari collection. Need to inform the artisan coordinator to plan production capacity.',
      date: formatDate(yesterday),
      tags: ['client', 'sales', 'meeting']
    },
    {
      id: '3',
      title: 'Financial Review - Q2',
      content: 'Quarterly financial review completed for WeaveMitra. Revenue up 12% from last quarter mainly due to increased online sales. Expenses increased by 7% due to raw material costs. Handloom sarees showing strongest growth at 18%. Need to expand production capacity.',
      date: formatDate(lastWeek),
      tags: ['finance', 'review', 'quarterly']
    },
    {
      id: '4',
      title: 'Artisan Training Program',
      content: 'Concluded the 2-week training program for 12 new weavers from Chitradurga district. All participants successfully learned Ilkal weaving techniques. Arranged for looms and initial materials. Training cost: ₹85,000. Expected production to begin next month.',
      date: formatDate(lastWeek),
      tags: ['training', 'artisans', 'capacity']
    },
    {
      id: '5',
      title: 'New Natural Dye Supplier',
      content: 'Met with Organic Dye Solutions who can supply natural indigo and other plant-based dyes at 15% lower cost than our current supplier. Quality samples tested and approved by master artisans. Will place initial trial order for 50kg of assorted dyes.',
      date: formatDate(lastMonth),
      tags: ['supplier', 'materials', 'sustainability']
    },
    {
      id: '6',
      title: 'Government Handloom Subsidy Approval',
      content: 'Received approval for the handloom sector subsidy from the Ministry of Textiles. WeaveMitra will receive ₹12,50,000 for upgrading traditional looms and providing training. Need to submit utilization plan within 30 days.',
      date: formatDate(lastMonth),
      tags: ['government', 'subsidy', 'development']
    }
  ];
}

// GET /api/daybook/test - Return mock data for testing the daybook
export async function GET(_request: NextRequest) {
  return NextResponse.json(mockEntries);
}

// POST /api/daybook/test - Create a new mock entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, date, tags } = body;
    
    // Validate required fields
    if (!title || !content || !date) {
      return NextResponse.json(
        { error: 'Title, content, and date are required' },
        { status: 400 }
      );
    }
    
    // Create a new entry with generated ID
    const newEntry = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      content,
      date, // Keep the ISO string format
      tags: Array.isArray(tags) ? tags : []
    };
    
    // Add to the mock entries
    mockEntries = [newEntry, ...mockEntries];
    
    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating mock entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
} 