'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TruckIcon,
  PackageIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Map,
  CalendarClock,
  Users,
  Filter,
  ArrowUpDown,
  Eye,
  ClipboardCheck
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

// Mock data
const supplierPerformance = [
  { name: 'Quality', target: 95, actual: 92 },
  { name: 'On-time Delivery', target: 90, actual: 87 },
  { name: 'Cost Adherence', target: 100, actual: 96 },
  { name: 'Responsiveness', target: 85, actual: 83 },
  { name: 'Documentation', target: 90, actual: 92 },
];

const deliveryPerformanceData = [
  { month: 'Jan', onTime: 88, delayed: 12 },
  { month: 'Feb', onTime: 85, delayed: 15 },
  { month: 'Mar', onTime: 92, delayed: 8 },
  { month: 'Apr', onTime: 94, delayed: 6 },
  { month: 'May', onTime: 89, delayed: 11 },
  { month: 'Jun', onTime: 91, delayed: 9 },
];

const materialSourceMap = [
  { name: 'Varanasi', value: 32, color: '#0088FE' },
  { name: 'Pochampally', value: 25, color: '#00C49F' },
  { name: 'Bhagalpur', value: 18, color: '#FFBB28' },
  { name: 'Kanchipuram', value: 15, color: '#FF8042' },
  { name: 'Others', value: 10, color: '#8884d8' },
];

const supplierRatings = [
  { name: 'Silk Weavers Cooperative', type: 'Yarn & Raw Silk', rating: 4.8, onTimeDelivery: 95, qualityScore: 98, lastDelivery: '2025-04-02', status: 'Active' },
  { name: 'Handloom Artisans Group', type: 'Fabric', rating: 4.5, onTimeDelivery: 87, qualityScore: 92, lastDelivery: '2025-04-08', status: 'Active' },
  { name: 'Traditional Dye Works', type: 'Dyes & Colors', rating: 4.2, onTimeDelivery: 90, qualityScore: 85, lastDelivery: '2025-03-25', status: 'Active' },
  { name: 'Zari Crafters Ltd.', type: 'Embellishments', rating: 3.9, onTimeDelivery: 82, qualityScore: 90, lastDelivery: '2025-03-15', status: 'Warning' },
  { name: 'Modern Textile Supplies', type: 'Packaging', rating: 4.6, onTimeDelivery: 97, qualityScore: 94, lastDelivery: '2025-04-10', status: 'Active' },
];

const incomingShipments = [
  { 
    id: 'PO-2025-042', 
    supplier: 'Silk Weavers Cooperative', 
    items: 'Raw Mulberry Silk - 45kg', 
    value: 125000, 
    expectedArrival: '2025-04-25', 
    status: 'In Transit', 
    daysTillArrival: 8
  },
  { 
    id: 'PO-2025-039', 
    supplier: 'Traditional Dye Works', 
    items: 'Natural Dyes - Assorted', 
    value: 35000, 
    expectedArrival: '2025-04-22', 
    status: 'In Transit', 
    daysTillArrival: 5
  },
  { 
    id: 'PO-2025-040', 
    supplier: 'Handloom Artisans Group', 
    items: 'Cotton Fabric - 250m', 
    value: 62000, 
    expectedArrival: '2025-04-20', 
    status: 'Delayed', 
    daysTillArrival: 3
  },
  { 
    id: 'PO-2025-037', 
    supplier: 'Modern Textile Supplies', 
    items: 'Packaging Materials', 
    value: 18500, 
    expectedArrival: '2025-04-18', 
    status: 'Arrived', 
    daysTillArrival: 0
  },
];

const outgoingOrders = [
  { 
    id: 'ORD-5621', 
    customer: 'Ethnic Emporium', 
    items: 'Silk Sarees - 25 pcs', 
    value: 185000, 
    requestedDelivery: '2025-04-28', 
    status: 'Processing', 
    progress: 35
  },
  { 
    id: 'ORD-5617', 
    customer: 'Traditional Trends', 
    items: 'Handloom Fabric - 120m', 
    value: 72000, 
    requestedDelivery: '2025-04-25', 
    status: 'Ready for Shipment', 
    progress: 90
  },
  { 
    id: 'ORD-5609', 
    customer: 'Heritage Boutique', 
    items: 'Ready-to-wear Collection', 
    value: 95500, 
    requestedDelivery: '2025-04-22', 
    status: 'In Transit', 
    progress: 75
  },
  { 
    id: 'ORD-5602', 
    customer: 'Artisan Collections', 
    items: 'Accessories & Fabrics', 
    value: 54000, 
    requestedDelivery: '2025-04-19', 
    status: 'Delivered', 
    progress: 100
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function SupplyChainDashboard() {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [supplierFilter, setSupplierFilter] = useState<'all' | 'active' | 'warning'>('all');
  
  // Filter suppliers based on selected filter
  const filteredSuppliers = supplierFilter === 'all' 
    ? supplierRatings 
    : supplierRatings.filter(supplier => supplier.status.toLowerCase() === supplierFilter);
  
  // Calculate summary metrics
  const averageDeliveryTime = 4.2; // days
  const onTimeDeliveryRate = 91; // percent
  const pendingShipments = incomingShipments.filter(s => s.status !== 'Arrived').length;
  const riskFactors = 2; // number of high risk factors in supply chain
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Supply Chain Management</h2>
          <p className="text-muted-foreground">
            Monitor suppliers, track orders, and optimize your textile supply chain
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            variant={timeframe === 'weekly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </Button>
          <Button 
            variant={timeframe === 'monthly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </Button>
          <Button 
            variant={timeframe === 'quarterly' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeframe('quarterly')}
          >
            Quarterly
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Delivery Time</p>
              <div className="flex items-baseline mt-2">
                <h3 className="text-2xl font-bold">{averageDeliveryTime}</h3>
                <span className="ml-1 text-sm text-gray-500">days</span>
              </div>
            </div>
            <div className="flex items-center text-blue-500">
              <Clock className="h-10 w-10 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">From supplier to warehouse</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">On-Time Delivery</p>
              <div className="flex items-baseline mt-2">
                <h3 className="text-2xl font-bold">{onTimeDeliveryRate}%</h3>
              </div>
            </div>
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-10 w-10 p-2 bg-green-100 dark:bg-green-900/30 rounded-full" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Last 30 days performance</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Shipments</p>
              <div className="flex items-baseline mt-2">
                <h3 className="text-2xl font-bold">{pendingShipments}</h3>
              </div>
            </div>
            <div className="flex items-center text-amber-500">
              <TruckIcon className="h-10 w-10 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Awaiting arrival</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Factors</p>
              <div className="flex items-baseline mt-2">
                <h3 className="text-2xl font-bold">{riskFactors}</h3>
                <span className="ml-1 text-sm text-gray-500">issues</span>
              </div>
            </div>
            <div className="flex items-center text-red-500">
              <AlertTriangle className="h-10 w-10 p-2 bg-red-100 dark:bg-red-900/30 rounded-full" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Require attention</p>
        </Card>
      </div>

      {/* Supplier Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Supplier Performance Metrics</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={supplierPerformance}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
              <Legend />
              <Bar dataKey="actual" name="Actual" fill="#60a5fa" radius={[0, 4, 4, 0]} />
              <Bar dataKey="target" name="Target" fill="#93c5fd" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Delivery Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Delivery Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deliveryPerformanceData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                stackOffset="expand"
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(tick) => `${tick}%`} />
                <Tooltip formatter={(value) => [`${value}%`, '']} />
                <Legend />
                <Bar dataKey="onTime" name="On Time" stackId="a" fill="#4ade80" />
                <Bar dataKey="delayed" name="Delayed" stackId="a" fill="#f87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Material Source Map */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Raw Material Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialSourceMap}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {materialSourceMap.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Source Distribution']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Map className="h-4 w-4 mr-2" />
              View Source Map
            </Button>
          </div>
        </Card>
      </div>

      {/* Supplier List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Key Suppliers</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant={supplierFilter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSupplierFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={supplierFilter === 'active' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSupplierFilter('active')}
            >
              Active
            </Button>
            <Button 
              variant={supplierFilter === 'warning' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setSupplierFilter('warning')}
            >
              Needs Attention
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 font-medium text-gray-500">
                  <div className="flex items-center">
                    Supplier
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th className="text-left py-3 font-medium text-gray-500">Category</th>
                <th className="text-center py-3 font-medium text-gray-500">Rating</th>
                <th className="text-center py-3 font-medium text-gray-500">On-Time</th>
                <th className="text-center py-3 font-medium text-gray-500">Quality</th>
                <th className="text-right py-3 font-medium text-gray-500">Last Delivery</th>
                <th className="text-right py-3 font-medium text-gray-500">Status</th>
                <th className="text-right py-3 font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.name} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 font-medium">{supplier.name}</td>
                  <td className="py-3">{supplier.type}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.rating >= 4.5 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : supplier.rating >= 4.0
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {supplier.rating}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-center">{supplier.onTimeDelivery}%</td>
                  <td className="py-3 text-center">{supplier.qualityScore}%</td>
                  <td className="py-3 text-right">{new Date(supplier.lastDelivery).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      supplier.status === 'Active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Add New Supplier
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Incoming Shipments */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Incoming Shipments</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {incomingShipments.map((shipment) => (
              <div key={shipment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{shipment.supplier}</div>
                    <div className="text-sm text-gray-500">{shipment.items}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(shipment.value)}</div>
                    <div className="text-sm text-gray-500">PO: {shipment.id}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm">
                      {new Date(shipment.expectedArrival).toLocaleDateString()}
                      {shipment.status !== 'Arrived' && ` (${shipment.daysTillArrival} days)`}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    shipment.status === 'Arrived' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : shipment.status === 'Delayed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {shipment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Outgoing Orders */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Outgoing Orders</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {outgoingOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-sm text-gray-500">{order.items}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(order.value)}</div>
                    <div className="text-sm text-gray-500">{order.id}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{order.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className={`h-2.5 rounded-full ${
                        order.status === 'Delivered' 
                          ? 'bg-green-500' 
                          : order.status === 'Delayed'
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                      }`} 
                      style={{ width: `${order.progress}%` }}>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm">{new Date(order.requestedDelivery).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'Delivered' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : order.status === 'Delayed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : order.status === 'In Transit'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : order.status === 'Ready for Shipment'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Logistics Action Center */}
      <Card className="p-6 border-l-4 border-l-indigo-500">
        <div className="flex items-center mb-4">
          <ClipboardCheck className="h-6 w-6 text-indigo-500 mr-2" />
          <h3 className="text-lg font-medium">Logistics Action Center</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
            <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Urgent Actions</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                <span>Follow up on PO-2025-040 delayed shipment from Handloom Artisans</span>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                <span>Quality check required for last silk batch from Varanasi</span>
              </li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-900/10">
            <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">Upcoming Deadlines</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <Clock className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                <span>Order ORD-5621 needs processing by Apr 21 to meet delivery date</span>
              </li>
              <li className="flex items-start">
                <Clock className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                <span>Replenish yarn inventory in 5 days (below reorder level)</span>
              </li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
            <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Recommendations</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Schedule bulk order of raw materials before monsoon season</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                <span>Consider alternative suppliers for zari work to improve delivery times</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
} 