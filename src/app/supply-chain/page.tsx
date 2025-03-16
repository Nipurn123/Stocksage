'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  RefreshCcw, 
  FileDown, 
  Truck, 
  Users, 
  ShoppingCart, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  ArrowUpRight,
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock data for demo purposes
const supplyChainMetrics = {
  activeSuppliers: 24,
  pendingOrders: 8,
  inTransitShipments: 5,
  averageLeadTime: 4.2, // days
  onTimeDeliveryRate: 92, // percentage
  qualityScore: 96, // percentage
  inventoryTurnover: 12, // times per year
  totalSpend: 125000, // in currency
  suppliersChange: 4, // percentage increase
  ordersChange: -2, // percentage decrease
  shipmentsChange: 8, // percentage increase
};

const recentOrders = [
  { 
    id: 'PO-2023-043', 
    supplier: 'Yarn Spinners Ltd.', 
    dateCreated: '2023-03-12', 
    expectedDelivery: '2023-03-18', 
    status: 'pending', 
    amount: 12500 
  },
  { 
    id: 'PO-2023-042', 
    supplier: 'Cotton Weavers Co.', 
    dateCreated: '2023-03-10', 
    expectedDelivery: '2023-03-16', 
    status: 'in-transit', 
    amount: 8900 
  },
  { 
    id: 'PO-2023-041', 
    supplier: 'Dye Solutions Inc.', 
    dateCreated: '2023-03-09', 
    expectedDelivery: '2023-03-15', 
    status: 'completed', 
    amount: 5400 
  },
  { 
    id: 'PO-2023-040', 
    supplier: 'Textile Machines Ltd.', 
    dateCreated: '2023-03-08', 
    expectedDelivery: '2023-03-12', 
    status: 'completed', 
    amount: 28700 
  },
];

const supplyRisks = [
  { 
    id: 1, 
    description: 'Late delivery from Yarn Spinners Ltd.', 
    impact: 'high', 
    action: 'Contact supplier for updated timeline' 
  },
  { 
    id: 2, 
    description: 'Price increase for raw cotton expected', 
    impact: 'medium', 
    action: 'Review alternative suppliers' 
  },
  { 
    id: 3, 
    description: 'Quality issues with recent dye batch', 
    impact: 'high', 
    action: 'Schedule quality inspection' 
  },
];

export default function SupplyChainPage() {
  const router = useRouter();
  
  // Helper function to render status badges
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'in-transit':
        return <Badge variant="warning"><Truck className="h-3 w-3 mr-1" />In Transit</Badge>;
      case 'completed':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  // Helper function to render trend indicators
  const renderTrend = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center text-emerald-500 text-sm">
          <TrendingUp className="h-4 w-4 mr-1" />
          +{value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center text-rose-500 text-sm">
          <TrendingDown className="h-4 w-4 mr-1" />
          {value}%
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Supply Chain Overview</h1>
          <p className="text-muted-foreground">
            Monitor your textile supply chain performance and key metrics
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" onClick={() => router.push('/supply-chain/orders/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Suppliers</p>
              <h3 className="text-2xl font-bold mt-1">{supplyChainMetrics.activeSuppliers}</h3>
              <div className="mt-1">{renderTrend(supplyChainMetrics.suppliersChange)}</div>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg dark:bg-indigo-900/20">
              <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Orders</p>
              <h3 className="text-2xl font-bold mt-1">{supplyChainMetrics.pendingOrders}</h3>
              <div className="mt-1">{renderTrend(supplyChainMetrics.ordersChange)}</div>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg dark:bg-amber-900/20">
              <ShoppingCart className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In-Transit Shipments</p>
              <h3 className="text-2xl font-bold mt-1">{supplyChainMetrics.inTransitShipments}</h3>
              <div className="mt-1">{renderTrend(supplyChainMetrics.shipmentsChange)}</div>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
              <Truck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spend YTD</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(supplyChainMetrics.totalSpend)}</h3>
              <p className="text-xs text-gray-500 mt-1">Last updated today</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg dark:bg-green-900/20">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Second row of metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-full dark:bg-emerald-900/20">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">On-Time Delivery</p>
              <div className="flex items-end gap-1">
                <h3 className="text-xl font-bold">{supplyChainMetrics.onTimeDeliveryRate}%</h3>
                <p className="text-xs text-gray-500 pb-0.5">of orders</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full dark:bg-blue-900/20">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Lead Time</p>
              <div className="flex items-end gap-1">
                <h3 className="text-xl font-bold">{supplyChainMetrics.averageLeadTime}</h3>
                <p className="text-xs text-gray-500 pb-0.5">days</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-full dark:bg-purple-900/20">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inventory Turnover</p>
              <div className="flex items-end gap-1">
                <h3 className="text-xl font-bold">{supplyChainMetrics.inventoryTurnover}×</h3>
                <p className="text-xs text-gray-500 pb-0.5">yearly</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Recent Orders & Supply Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Recent Purchase Orders</h3>
                <Link href="/supply-chain/orders">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date Created</TableHead>
                    <TableHead>Expected Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link href={`/supply-chain/orders/${order.id}`} className="hover:text-blue-600 hover:underline">
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{order.supplier}</TableCell>
                      <TableCell>{formatDate(order.dateCreated)}</TableCell>
                      <TableCell>{formatDate(order.expectedDelivery)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(order.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
        
        <div>
          <Card>
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Supply Chain Risks</h3>
                <Link href="/supply-chain/analytics">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Analytics
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {supplyRisks.map((risk) => (
                <div key={risk.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={
                      risk.impact === 'high' 
                        ? 'h-5 w-5 text-rose-500 mt-0.5' 
                        : risk.impact === 'medium'
                          ? 'h-5 w-5 text-amber-500 mt-0.5'
                          : 'h-5 w-5 text-gray-400 mt-0.5'
                    } />
                    <div>
                      <p className="font-medium text-sm">{risk.description}</p>
                      <div className="flex justify-between items-center mt-1">
                        <Badge variant={
                          risk.impact === 'high' ? 'destructive' : 
                          risk.impact === 'medium' ? 'warning' : 'secondary'
                        }>
                          {risk.impact.toUpperCase()} IMPACT
                        </Badge>
                        <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          {risk.action}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 