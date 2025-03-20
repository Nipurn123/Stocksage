# StockSage

StockSage is an inventory and invoice management system built with Next.js.

## Deployment Instructions

### Environment Variables

This project requires the following environment variables:

#### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_******
CLERK_SECRET_KEY=sk_test_******
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### NextAuth Configuration
```
NEXTAUTH_SECRET=your-secure-secret-key
NEXTAUTH_URL=https://your-deployment-url.vercel.app
NEXTAUTH_DEBUG=false
```

#### Stripe Integration (if using payment features)
```
STRIPE_SECRET_KEY=sk_test_******
STRIPE_PUBLISHABLE_KEY=pk_test_******
STRIPE_WEBHOOK_SECRET=whsec_******
```

### Vercel Deployment

1. Create a new project on Vercel
2. Connect your repository
3. Add the required environment variables in the project settings
4. Deploy

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Features

- Inventory management
- Invoice generation and tracking
- Customer management
- Financial reporting
- Integration with payment processors

## Technologies

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Clerk Authentication
- NextAuth.js
- Prisma ORM

## 🌟 Features

- **Modern UI with Dark Mode**: Fully responsive interface with light and dark mode support, remembering user preference across the application
- **Invoice Management**: Create, view, and manage invoices with detailed line items
- **AI-Powered Invoice Scanner**: Upload and automatically extract data from invoice images using Google's Gemini Vision API
- **Seamless Invoicing**: Create and send professional invoices with Stripe integration and automatic payment tracking
- **Inventory Sync**: Automatically sync inventory levels with Zoho Inventory when invoices are created
- **Compliance Management**: Track and manage tax compliance and financial regulations
- **Financial Dashboard**: Visual analytics for cash flow, payments, and financial health
- **Inventory Management**: Track stock levels, products, and inventory movements
- **User Authentication**: Secure login system with guest mode for demonstration
- **Dashboard Analytics**: Visual representation of sales and inventory data
- **Mobile-Optimized**: Fully responsive design for creating and managing invoices on any device

## 🔧 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with dark mode support
- **Authentication**: NextAuth.js
- **AI Integration**: Google Gemini Vision API
- **Payment Processing**: Stripe API for invoicing
- **Inventory Integration**: Zoho Inventory API
- **PDF Generation**: jsPDF for custom invoice templates
- **Database**: SQLite with Prisma ORM
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom component library with Tailwind

## 📝 Prerequisites

- Node.js 18.0 or later
- A Gemini API key (for production use of the invoice scanner)
- Stripe account and API keys (for invoicing features)
- Zoho Inventory account and API credentials (for inventory sync)

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stocksage.git
   cd stocksage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following environment variables:
   ```
   # Database
   DATABASE_URL="file:./prisma/dev.db"
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_here
   NEXTAUTH_DEBUG=false
   
   # For production use of Gemini Vision API
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Stripe API
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   
   # Zoho Inventory API
   ZOHO_CLIENT_ID=your_zoho_client_id
   ZOHO_CLIENT_SECRET=your_zoho_client_secret
   ZOHO_REFRESH_TOKEN=your_zoho_refresh_token
   ZOHO_ORGANIZATION_ID=your_zoho_organization_id
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🖼️ Dark Mode

StockSage features a comprehensive dark mode implementation that:

1. Respects user system preferences by default
2. Allows manual toggling via a theme button in the header
3. Persists the selected theme across routes and application sessions
4. Provides visually consistent UI components in both light and dark themes

The theme implementation uses React Context API and local storage for persistence, with a smooth transition between themes.

## 🤖 AI-Powered Invoice Scanner

The Invoice Scanner feature allows users to:

1. Upload invoice images in various formats (JPG, PNG, PDF, etc.)
2. Automatically extract key information using Google's Gemini Vision API
3. Review the extracted data with confidence scores
4. Edit and correct any information as needed
5. Create invoice records from the extracted data

In production, the feature connects to Google's Gemini Vision API to analyze invoice images. For development and demonstration purposes, a mock implementation is provided.

## 💳 Seamless Invoicing and Compliance

The Automated Invoicing feature provides a complete solution for creating and managing professional invoices:

1. **Create Professional Invoices**: Generate invoices with custom templates and branding
2. **Stripe Integration**: Send invoices directly to customers via Stripe
3. **Payment Tracking**: Automatically track payment status and receive notifications
4. **Custom PDF Templates**: Choose from multiple invoice designs or create your own
5. **Zoho Inventory Sync**: Automatically update inventory levels when invoices are created
6. **Compliance Management**: Track tax compliance and financial regulations
7. **Compliance Calendar**: Get reminders for important filing dates and deadlines
8. **Compliance Reports**: Generate reports for tax and financial compliance
9. **Financial Visualizations**: Interactive charts for cash flow, accounts receivable aging, and payment trends
10. **Customer Management**: Store and manage customer information with payment history
11. **Mobile Invoice Creation**: Create and send invoices from any device with a responsive UI
12. **Bulk Actions**: Process multiple invoices simultaneously for efficient workflow
13. **Customizable Tax Rules**: Configure tax rates based on product categories and locations

### Financial Dashboard

The Financial Dashboard provides comprehensive analytics to help businesses understand their financial health:

- **Cash Flow Visualization**: Track incoming and outgoing payments with interactive charts
- **Accounts Receivable Aging**: Monitor outstanding payments and identify collection priorities
- **Payment Cycle Analysis**: Understand payment patterns to improve cash flow predictions
- **Revenue Trends**: Visualize monthly and quarterly revenue trends with comparative analytics
- **Tax Liability Tracking**: Monitor accumulated tax obligations for better compliance planning
- **Custom Financial Reports**: Generate reports for different time periods and financial metrics

### Main Dashboard Features

The Main Dashboard provides a comprehensive overview of your business at a glance:

- **Inventory Summary**: View total products, low stock items, and out-of-stock items with quick navigation
- **Sales Overview**: Monitor today's sales, this week's revenue, and monthly performance metrics
- **Recent Activities**: Track recent orders, inventory updates, and important alerts in real-time
- **Top Selling Products**: Identify your best performers with detailed sales metrics and ranking
- **Recent Invoices**: Monitor recent invoice status with quick access to payment information
- **Quick Actions**: Access frequently used functions like adding products and creating invoices

### Mobile Responsiveness

All invoicing features are fully responsive and optimized for mobile use:

- **On-the-Go Invoice Creation**: Create new invoices from any device with a streamlined mobile interface
- **Mobile Payment Tracking**: Monitor invoice status and payment notifications on mobile
- **Optimized Invoice Previews**: View and share invoice PDFs on smaller screens
- **Responsive Data Tables**: View and manage invoice lists with mobile-optimized tables
- **Touch-Friendly Controls**: Large touch targets and simplified workflows for mobile users

### Setting Up Stripe Integration

To enable Stripe invoicing:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Obtain your API keys from the Stripe Dashboard
3. Add your keys to the `.env.local` file
4. Set up a webhook endpoint in your Stripe Dashboard pointing to `/api/stripe/webhook`

### Setting Up Zoho Inventory Integration

To enable inventory synchronization:

1. Create a Zoho Inventory account at [zoho.com/inventory](https://www.zoho.com/inventory)
2. Create a self-client application in the Zoho Developer Console
3. Generate API credentials and add them to the `.env.local` file

## 📁 Project Structure

```
stocksage/
├── prisma/           # Prisma schema and migrations
├── public/           # Static assets
├── src/
│   ├── app/          # Next.js App Router pages
│   │   ├── api/      # API routes
│   │   ├── financial/# Financial management pages
│   │   └── invoices/ # Invoice management pages
│   ├── components/   # Reusable UI components
│   │   ├── financial/# Financial components
│   │   ├── invoices/ # Invoice components
│   │   ├── layout/   # Layout components
│   │   └── ui/       # UI components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and libraries
│   │   ├── stripe.ts # Stripe integration
│   │   ├── zoho.ts   # Zoho integration
│   │   └── pdfGenerator.ts # PDF generation
│   ├── services/     # API service functions
│   ├── styles/       # Global styles and Tailwind configuration
│   └── types/        # TypeScript type definitions
├── .env.example      # Example environment variables
├── next.config.js    # Next.js configuration
├── package.json      # Project dependencies
├── tailwind.config.js# Tailwind CSS configuration
└── tsconfig.json     # TypeScript configuration
```

## 🚧 Development

### Adding New Features

1. Create components in the `components` directory
2. Add pages in the `app` directory
3. Update types in the `types` directory as needed
4. Add API routes in the `app/api` directory

## 🌐 Deployment

### Vercel

The easiest way to deploy StockSage is using Vercel:

```bash
npm install -g vercel
vercel
```

### Docker

A Dockerfile is provided for containerized deployment:

```bash
docker build -t stocksage .
docker run -p 3000:3000 stocksage
```

### Custom Server

For deployment on a custom server:

```bash
npm run build
npm start
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.