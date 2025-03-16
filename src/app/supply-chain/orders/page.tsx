'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  RefreshCcw, 
  FileDown, 
  Filter,
  Clock, 
  Truck, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
import { Pagination } from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import { formatCurrency, formatDate } from '@/lib/utils';

// Mock data for demo purposes
const orders = [
  { 
    id: 'PO-2023-043', 
    supplier: 'Yarn Spinners Ltd.',
    supplierContact: 'Rahul Desai',
    dateCreated: '2023-03-12', 
    expectedDelivery: '2023-03-18', 
    status: 'pending', 
    amount: 12500,
    items: [
      { name: 'Cotton Yarn', quantity: 500, unit: 'kg', price: 20 },
      { name: 'Silk Yarn', quantity: 50, unit: 'kg', price: 50 }
    ]
  },
  { 
    id: 'PO-2023-042', 
    supplier: 'Cotton Weavers Co.',
    supplierContact: 'Priya Mehta',
    dateCreated: '2023-03-10', 
    expectedDelivery: '2023-03-16', 
    status: 'in-transit', 
    amount: 8900,
    items: [
      { name: 'Raw Cotton', quantity: 300, unit: 'kg', price: 15 },
      { name: 'Processed Cotton', quantity: 200, unit: 'kg', price: 22 }
    ]
  },
  { 
    id: 'PO-2023-041', 
    supplier: 'Dye Solutions Inc.',
    supplierContact: 'Amit Sharma',
    dateCreated: '2023-03-09', 
    expectedDelivery: '2023-03-15', 
    status: 'completed', 
    amount: 5400,
    items: [
      { name: 'Natural Dyes', quantity: 20, unit: 'kg', price: 120 },
      { name: 'Fixatives', quantity: 30, unit: 'L', price: 60 }
    ]
  },
  { 
    id: 'PO-2023-040', 
    supplier: 'Textile Machines Ltd.',
    supplierContact: 'Vikram Singh',
    dateCreated: '2023-03-08', 
    expectedDelivery: '2023-03-12', 
    status: 'completed', 
    amount: 28700,
    items: [
      { name: 'Loom Parts', quantity: 5, unit: 'sets', price: 2500 },
      { name: 'Weaving Tools', quantity: 10, unit: 'sets', price: 1370 }
    ]
  },
  { 
    id: 'PO-2023-039', 
    supplier: 'Textile Machines Ltd.',
    supplierContact: 'Vikram Singh',
    dateCreated: '2023-03-05', 
    expectedDelivery: '2023-03-20', 
    status: 'cancelled', 
    amount: 15600,
    items: [
      { name: 'Spinning Machine', quantity: 1, unit: 'unit', price: 15600 }
    ]
  },
  { 
    id: 'PO-2023-038', 
    supplier: 'Handloom Artisans',
    supplierContact: 'Kavita Reddy',
    dateCreated: '2023-03-01', 
    expectedDelivery: '2023-03-10', 
    status: 'completed', 
    amount: 3200,
    items: [
      { name: 'Handcrafted Fabrics', quantity: 20, unit: 'meter', price: 160 }
    ]
  }
];

export default function OrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter orders based on search query and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Date filter logic
    let matchesDate = true;
    const orderDate = new Date(order.dateCreated);
    const now = new Date();
    
    if (dateFilter === 'last7days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesDate = orderDate >= sevenDaysAgo;
    } else if (dateFilter === 'last30days') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchesDate = orderDate >= thirtyDaysAgo;
    } else if (dateFilter === 'last90days') {
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      matchesDate = orderDate >= ninetyDaysAgo;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
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
  
  // Handler for deleting an order
  const handleDeleteOrder = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete order ${id}?`)) {
      // In a real app, this would call an API to delete the order
      console.log(`Deleting order ${id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage your purchase orders and track raw material acquisitions
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
      
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'in-transit', label: 'In Transit' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' }
            ]}
            className="w-[150px]"
          />
          
          <Select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: 'last7days', label: 'Last 7 Days' },
              { value: 'last30days', label: 'Last 30 Days' },
              { value: 'last90days', label: 'Last 90 Days' }
            ]}
            className="w-[150px]"
          />
        </div>
      </div>
      
      {/* Orders List */}
      <Card>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  onClick={() => router.push(`/supply-chain/orders/${order.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      {order.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>{order.supplier}</div>
                      <div className="text-xs text-gray-500">{order.supplierContact}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(order.dateCreated)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(order.expectedDelivery)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{formatCurrency(order.amount)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/supply-chain/orders/${order.id}`);
                        }}
                      >
                        <Eye size={16} className="text-gray-500" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/supply-chain/orders/${order.id}/edit`);
                        }}
                        disabled={order.status === 'completed' || order.status === 'cancelled'}
                      >
                        <Edit size={16} className="text-blue-500" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteOrder(order.id, e)}
                        disabled={order.status === 'in-transit'}
                      >
                        <Trash2 size={16} className="text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <FileText className="h-8 w-8 mb-2" />
                      <p>No orders found matching your search criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-gray-200 dark:border-gray-800">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full dark:bg-blue-900/20">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Orders</p>
              <h3 className="text-xl font-bold">
                {orders.filter(order => order.status === 'pending').length}
              </h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-full dark:bg-amber-900/20">
              <Truck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In Transit</p>
              <h3 className="text-xl font-bold">
                {orders.filter(order => order.status === 'in-transit').length}
              </h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-full dark:bg-green-900/20">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed This Month</p>
              <h3 className="text-xl font-bold">
                {orders.filter(order => order.status === 'completed').length}
              </h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 