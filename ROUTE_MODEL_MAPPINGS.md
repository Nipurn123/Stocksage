# Route to Database Model Mappings

This document provides a comprehensive mapping between the application's routes and the database models that store data for each route.

## Authentication Routes

- `/auth/login` - Uses the `User`, `Account`, and `Session` models
- `/auth/register` - Uses the `User` model
- `/auth/sso-callback` - Uses the `User` and `Account` models

## Dashboard Routes

- `/dashboard` - Uses the `DashboardData` model which includes summary data from various other models

## Inventory Routes

- `/inventory` - Uses the `Product` model (main inventory listing)
- `/inventory/add` - Uses the `Product` model (create new inventory items)
- `/inventory/[id]` - Uses the `Product` model (view specific product)
- `/inventory/[id]/edit` - Uses the `Product` model (edit specific product)
- `/inventory/logs` - Uses the `InventoryLog` model (track inventory changes)
- `/inventory/categories` - Uses the `Category` model (product categories)
- `/inventory/reports` - Uses the `InventoryReport` model (inventory reports)
- `/inventory/barcode` - Uses the `Barcode` model (barcode management)

## Invoice Routes

- `/invoices` - Uses the `Invoice` model (main invoice listing)
- `/invoices/create` - Uses the `Invoice` and `InvoiceItem` models (create new invoice)
- `/invoices/scan` - Uses the `Invoice` model (scan invoice)
- `/invoices/manual` - Uses the `Invoice` model (manual invoice entry)
- `/invoices/[id]` - Uses the `Invoice` and `InvoiceItem` models (view specific invoice)
- `/invoices/[id]/edit` - Uses the `Invoice` and `InvoiceItem` models (edit invoice)
- `/invoices/[id]/receipt` - Uses the `Invoice` and `Payment` models (view receipt)
- `/invoices/pending` - Uses the `Invoice` model (filtered by status)
- `/invoices/paid` - Uses the `Invoice` model (filtered by status)
- `/invoices/overdue` - Uses the `Invoice` model (filtered by status)

## Customer Routes

- `/customers` - Uses the `Customer` model (customer management)
- `/customers/[id]` - Uses the `Customer` model (view specific customer)

## Supply Chain Routes

- `/supply-chain` - Uses multiple models for supply chain management
- `/supply-chain/suppliers` - Uses the `Supplier` model (suppliers list)
- `/supply-chain/suppliers/add` - Uses the `Supplier` model (add supplier)
- `/supply-chain/suppliers/[id]` - Uses the `Supplier` model (view supplier)
- `/supply-chain/orders` - Uses the `PurchaseOrder` and `OrderItem` models (orders list)
- `/supply-chain/orders/new` - Uses the `PurchaseOrder` and `OrderItem` models (create order)
- `/supply-chain/orders/[id]` - Uses the `PurchaseOrder` and `OrderItem` models (view order)
- `/supply-chain/orders/[id]/edit` - Uses the `PurchaseOrder` and `OrderItem` models (edit order)
- `/supply-chain/shipments` - Uses the `Shipment` model (shipments list)
- `/supply-chain/shipments/[id]` - Uses the `Shipment` model (view shipment)
- `/supply-chain/analytics` - Uses data from `PurchaseOrder`, `Supplier`, and `Shipment` models

## Financial Routes

- `/financial/automated-invoicing` - Uses the `Invoice` and `InvoiceItem` models
- `/financial/automated-invoicing/new` - Uses the `Invoice` and `InvoiceItem` models (create automated invoice)
- `/financial/automated-invoicing/[id]` - Uses the `Invoice` and `InvoiceItem` models (view automated invoice)
- `/financial/automated-invoicing/payment/[id]` - Uses the `Payment` and `Invoice` models (process payment)
- `/financial/automated-invoicing/sent/[id]` - Uses the `Invoice` model (view sent invoice)
- `/financial/customers` - Uses the `Customer` model (financial customers view)
- `/financial/customers/[id]/invoices` - Uses the `Customer` and `Invoice` models (customer invoices)

## Financial Dashboard Routes

- `/financial-dashboard` - Uses the `FinancialDashboardData` model which includes summary financial data

## Reports Routes

- `/reports` - Uses the `FinancialReport` model for various types of reports

## Profile Routes

- `/profiles` - Uses the `Profile` model for user profile management

## Daybook Routes

- `/daybook` - Uses the `DaybookEntry` and `DaybookTag` models

## API Routes

These routes access the same models as their front-end counterparts but provide data access:

- `/api/inventory/*` - Access to Product, Category, and Inventory models
- `/api/invoices/*` - Access to Invoice and related models
- `/api/customers/*` - Access to Customer model
- `/api/reports/*` - Access to FinancialReport model
- `/api/dashboard/*` - Access to DashboardData model
- `/api/daybook/*` - Access to DaybookEntry model
- `/api/auth/*` - Access to authentication models
- `/api/stripe/*` - Payment processing with the Payment model

## Database Security

Each model includes:
- User relationship to ensure data isolation between users
- Created/updated timestamps for audit trails
- Proper foreign key relationships with appropriate cascade behavior

## Guest vs Authenticated Access

- Guest users have read-only access to certain routes (`/dashboard`, `/inventory`, `/invoices`, etc.)
- Authenticated users have full CRUD capabilities based on their role (admin, user)
- API endpoints that modify data (`/api/**/create`, `/api/**/update`, `/api/**/delete`) require full authentication 