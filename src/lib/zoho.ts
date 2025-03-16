import axios from 'axios';
import { prisma } from '@/lib/prisma';

interface ZohoToken {
  access_token: string;
  expires_at: number; // Timestamp when token expires
}

// Store token in memory cache
let tokenCache: ZohoToken | null = null;

export interface ZohoInventoryItem {
  item_id: string;
  name: string;
  sku: string;
  unit: string;
  status: string;
  description?: string;
  rate: number;
  tax_id?: string;
  tax_name?: string;
  tax_percentage?: number;
}

export interface SyncInvoiceItemsParams {
  invoiceId: string;
  organizationId?: string;
}

export const zohoService = {
  /**
   * Get a valid OAuth token for Zoho API
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (tokenCache && tokenCache.expires_at > Date.now()) {
      return tokenCache.access_token;
    }

    // Get a new token
    const clientId = process.env.ZOHO_CLIENT_ID;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Missing Zoho API credentials in environment variables');
    }

    try {
      const response = await axios.post(
        'https://accounts.zoho.com/oauth/v2/token',
        null,
        {
          params: {
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          },
        }
      );

      if (response.data && response.data.access_token) {
        // Cache the token (typically valid for 1 hour)
        tokenCache = {
          access_token: response.data.access_token,
          expires_at: Date.now() + (response.data.expires_in || 3600) * 1000,
        };
        return tokenCache.access_token;
      } else {
        throw new Error('Invalid response from Zoho OAuth service');
      }
    } catch (error) {
      console.error('Error getting Zoho access token:', error);
      throw new Error('Failed to authenticate with Zoho API');
    }
  },

  /**
   * Get inventory item details from Zoho by SKU
   */
  async getInventoryItemBySku(sku: string): Promise<ZohoInventoryItem | null> {
    const token = await this.getAccessToken();
    const organizationId = process.env.ZOHO_ORGANIZATION_ID;

    if (!organizationId) {
      throw new Error('Missing Zoho organization ID in environment variables');
    }

    try {
      const response = await axios.get(
        `https://inventory.zoho.com/api/v1/items`,
        {
          params: {
            organization_id: organizationId,
            sku,
          },
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
          },
        }
      );

      if (response.data && response.data.items && response.data.items.length > 0) {
        return response.data.items[0];
      }

      return null;
    } catch (error) {
      console.error('Error fetching Zoho inventory item:', error);
      return null;
    }
  },

  /**
   * Sync invoice items with Zoho Inventory
   */
  async syncInvoiceItems({
    invoiceId,
    organizationId = process.env.ZOHO_ORGANIZATION_ID,
  }: SyncInvoiceItemsParams): Promise<{
    success: boolean;
    syncedItems: number;
    failedItems: number;
    log: string;
  }> {
    if (!organizationId) {
      throw new Error('Missing Zoho organization ID');
    }

    // Get invoice and items from our database
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) {
      throw new Error(`Invoice with ID ${invoiceId} not found`);
    }

    let syncedItems = 0;
    let failedItems = 0;
    let logMessages: string[] = [`Starting sync for invoice ${invoice.invoiceNumber}`];

    // For each invoice item that has a productSku, update inventory in Zoho
    for (const item of invoice.items) {
      if (!item.productSku) {
        logMessages.push(`Skipping item "${item.description}" - No SKU provided`);
        continue;
      }

      try {
        // Get the item from Zoho inventory
        const zohoItem = await this.getInventoryItemBySku(item.productSku);

        if (!zohoItem) {
          logMessages.push(`Item with SKU ${item.productSku} not found in Zoho inventory`);
          failedItems++;
          continue;
        }

        // Get the access token
        const token = await this.getAccessToken();

        // Create an inventory adjustment to reduce stock
        const adjustmentResponse = await axios.post(
          'https://inventory.zoho.com/api/v1/inventoryadjustments',
          {
            adjustment_date: new Date().toISOString().split('T')[0],
            reason: `Invoice ${invoice.invoiceNumber}`,
            description: `Adjustment for invoice ${invoice.invoiceNumber}`,
            line_items: [
              {
                item_id: zohoItem.item_id,
                quantity_adjusted: item.quantity * -1, // Negative for reduction
                quantity_after_adjustment: 0, // Let Zoho calculate this
                adjustment_account_id: '0', // Use default
              },
            ],
          },
          {
            params: {
              organization_id: organizationId,
            },
            headers: {
              Authorization: `Zoho-oauthtoken ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (adjustmentResponse.data && adjustmentResponse.data.inventory_adjustment) {
          logMessages.push(
            `Successfully adjusted inventory for item ${item.productSku}: ${item.quantity} units`
          );
          
          // Update our database to mark this item as synced
          await prisma.invoiceItem.update({
            where: { id: item.id },
            data: {
              syncedWith: 'ZOHO',
              syncedAt: new Date(),
            },
          });
          
          syncedItems++;
        } else {
          logMessages.push(`Failed to adjust inventory for item ${item.productSku}`);
          failedItems++;
        }
      } catch (error) {
        console.error(`Error syncing item ${item.productSku}:`, error);
        logMessages.push(`Error syncing item ${item.productSku}: ${(error as Error).message}`);
        failedItems++;
      }
    }

    // Create a log entry
    const logEntry = await prisma.inventorySyncLog.create({
      data: {
        invoiceId: invoice.id,
        syncedAt: new Date(),
        status: failedItems === 0 ? 'SUCCESS' : failedItems === invoice.items.length ? 'FAILED' : 'PARTIAL',
        message: logMessages.join('\n'),
        system: 'Zoho Inventory',
      },
    });

    return {
      success: failedItems === 0,
      syncedItems,
      failedItems,
      log: logMessages.join('\n'),
    };
  },
}; 