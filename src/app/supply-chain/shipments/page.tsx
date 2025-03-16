'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  RefreshCcw, 
  FileDown, 
  Truck, 
  Package,
  MapPin,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  MoveRight,
  Box
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
import { formatDate } from '@/lib/utils';

// Mock data for demo purposes
const shipments = [
  {
    id: 'SH-2023-005',
    orderIds: ['PO-2023-042'],
    carrier: 'Express Logistics',
    trackingNumber: 'EL98765432',
    origin: 'Surat, Gujarat',
    destination: 'WeaveMitra Warehouse, Bangalore',
    status: 'in-transit',
    estimatedDelivery: '2023-03-16',
    departureDate: '2023-03-12',
    currentLocation: 'Mumbai, Maharashtra',
    lastUpdated: '2023-03-13T14:30:00',
    items: [
      { name: 'Raw Cotton', quantity: 300, unit: 'kg' },
      { name: 'Processed Cotton', quantity: 200, unit: 'kg' }
    ],
    checkpoints: [
      { 
        location: 'Surat, Gujarat', 
        timestamp: '2023-03-12T09:15:00', 
        status: 'picked-up',
        description: 'Shipment picked up from supplier'
      },
      { 
        location: 'Mumbai, Maharashtra', 
        timestamp: '2023-03-13T14:30:00', 
        status: 'in-transit',
        description: 'Shipment in transit to next hub'
      }
    ]
  },
  {
    id: 'SH-2023-004',
    orderIds: ['PO-2023-043'],
    carrier: 'FastTrack Delivery',
    trackingNumber: 'FTD1234567',
    origin: 'Ahmedabad, Gujarat',
    destination: 'WeaveMitra Warehouse, Bangalore',
    status: 'in-transit',
    estimatedDelivery: '2023-03-18',
    departureDate: '2023-03-14',
    currentLocation: 'Ahmedabad, Gujarat',
    lastUpdated: '2023-03-14T10:45:00',
    items: [
      { name: 'Cotton Yarn', quantity: 500, unit: 'kg' },
      { name: 'Silk Yarn', quantity: 50, unit: 'kg' }
    ],
    checkpoints: [
      { 
        location: 'Ahmedabad, Gujarat', 
        timestamp: '2023-03-14T10:45:00', 
        status: 'picked-up',
        description: 'Shipment picked up from supplier'
      }
    ]
  },
  {
    id: 'SH-2023-003',
    orderIds: ['PO-2023-041'],
    carrier: 'Reliable Freight',
    trackingNumber: 'RF7654321',
    origin: 'Mumbai, Maharashtra',
    destination: 'WeaveMitra Warehouse, Bangalore',
    status: 'delivered',
    estimatedDelivery: '2023-03-15',
    departureDate: '2023-03-10',
    currentLocation: 'Bangalore, Karnataka',
    lastUpdated: '2023-03-14T16:20:00',
    items: [
      { name: 'Natural Dyes', quantity: 20, unit: 'kg' },
      { name: 'Fixatives', quantity: 30, unit: 'L' }
    ],
    checkpoints: [
      { 
        location: 'Mumbai, Maharashtra', 
        timestamp: '2023-03-10T11:30:00', 
        status: 'picked-up',
        description: 'Shipment picked up from supplier'
      },
      { 
        location: 'Pune, Maharashtra', 
        timestamp: '2023-03-11T14:15:00', 
        status: 'in-transit',
        description: 'Shipment arrived at transit hub'
      },
      { 
        location: 'Hubli, Karnataka', 
        timestamp: '2023-03-13T09:40:00', 
        status: 'in-transit',
        description: 'Shipment in transit to destination'
      },
      { 
        location: 'Bangalore, Karnataka', 
        timestamp: '2023-03-14T16:20:00', 
        status: 'delivered',
        description: 'Shipment delivered to warehouse'
      }
    ]
  },
  {
    id: 'SH-2023-002',
    orderIds: ['PO-2023-040'],
    carrier: 'Heavy Haulers',
    trackingNumber: 'HH9870123',
    origin: 'Pune, Maharashtra',
    destination: 'WeaveMitra Warehouse, Bangalore',
    status: 'delivered',
    estimatedDelivery: '2023-03-12',
    departureDate: '2023-03-09',
    currentLocation: 'Bangalore, Karnataka',
    lastUpdated: '2023-03-11T15:10:00',
    items: [
      { name: 'Loom Parts', quantity: 5, unit: 'sets' },
      { name: 'Weaving Tools', quantity: 10, unit: 'sets' }
    ],
    checkpoints: [
      { 
        location: 'Pune, Maharashtra', 
        timestamp: '2023-03-09T08:30:00', 
        status: 'picked-up',
        description: 'Shipment picked up from supplier'
      },
      { 
        location: 'Kolhapur, Maharashtra', 
        timestamp: '2023-03-10T11:45:00', 
        status: 'in-transit',
        description: 'Shipment arrived at transit hub'
      },
      { 
        location: 'Bangalore, Karnataka', 
        timestamp: '2023-03-11T15:10:00', 
        status: 'delivered',
        description: 'Shipment delivered to warehouse'
      }
    ]
  },
  {
    id: 'SH-2023-001',
    orderIds: ['PO-2023-038'],
    carrier: 'Artisan Express',
    trackingNumber: 'AE4567890',
    origin: 'Jaipur, Rajasthan',
    destination: 'WeaveMitra Warehouse, Bangalore',
    status: 'delivered',
    estimatedDelivery: '2023-03-10',
    departureDate: '2023-03-03',
    currentLocation: 'Bangalore, Karnataka',
    lastUpdated: '2023-03-09T14:25:00',
    items: [
      { name: 'Handcrafted Fabrics', quantity: 20, unit: 'meter' }
    ],
    checkpoints: [
      { 
        location: 'Jaipur, Rajasthan', 
        timestamp: '2023-03-03T10:15:00', 
        status: 'picked-up',
        description: 'Shipment picked up from supplier'
      },
      { 
        location: 'Delhi, Delhi', 
        timestamp: '2023-03-04T16:30:00', 
        status: 'in-transit',
        description: 'Shipment arrived at transit hub'
      },
      { 
        location: 'Mumbai, Maharashtra', 
        timestamp: '2023-03-07T09:20:00', 
        status: 'in-transit',
        description: 'Shipment in transit to next hub'
      },
      { 
        location: 'Bangalore, Karnataka', 
        timestamp: '2023-03-09T14:25:00', 
        status: 'delivered',
        description: 'Shipment delivered to warehouse'
      }
    ]
  }
];

export default function ShipmentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-transit' | 'delivered'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter shipments based on search query and status filter
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Helper function to render status badges
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'in-transit':
        return <Badge variant="warning"><Truck className="h-3 w-3 mr-1" />In Transit</Badge>;
      case 'delivered':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'delayed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Delayed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Format date with time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipments</h1>
          <p className="text-muted-foreground">
            Track and monitor the movement of your raw materials
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
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search shipments..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant={statusFilter === 'all' ? 'default' : 'outline'} 
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === 'in-transit' ? 'default' : 'outline'} 
            onClick={() => setStatusFilter('in-transit')}
          >
            <Truck className="h-4 w-4 mr-2" />
            In Transit
          </Button>
          <Button 
            variant={statusFilter === 'delivered' ? 'default' : 'outline'} 
            onClick={() => setStatusFilter('delivered')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Delivered
          </Button>
        </div>
      </div>
      
      {/* Active Shipments Summary */}
      {statusFilter !== 'delivered' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedShipments
            .filter(shipment => shipment.status === 'in-transit')
            .slice(0, 2)
            .map(shipment => (
              <div key={shipment.id} 
                   className="p-4 hover:shadow-md transition-shadow cursor-pointer border rounded-lg"
                   onClick={() => router.push(`/supply-chain/shipments/${shipment.id}`)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{shipment.carrier}</h3>
                    <p className="text-sm text-gray-500">Tracking: {shipment.trackingNumber}</p>
                  </div>
                  {getStatusBadge(shipment.status)}
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {shipment.items.length} {shipment.items.length === 1 ? 'item' : 'items'} 
                    {shipment.items.map(item => item.name).join(', ')}
                  </span>
                </div>
                
                <div className="flex items-start gap-2 mb-4">
                  <div className="flex flex-col items-center mt-2">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div className="h-10 w-0.5 bg-gray-200 dark:bg-gray-700 my-1"></div>
                    <MapPin className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <p className="text-sm font-medium">{shipment.origin}</p>
                      <p className="text-xs text-gray-500">Departed: {formatDate(shipment.departureDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{shipment.destination}</p>
                      <p className="text-xs text-gray-500">Expected: {formatDate(shipment.estimatedDelivery)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1 bg-amber-50 rounded-full dark:bg-amber-900/20">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span>Last update at {formatDateTime(shipment.lastUpdated)}</span>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">Currently in: {shipment.currentLocation}</span>
                  <Button variant="ghost" size="sm" className="gap-1 text-blue-600 dark:text-blue-400">
                    View Details
                    <MoveRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      )}
      
      {/* Shipments List */}
      <Card>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment ID</TableHead>
                <TableHead>Carrier</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estimated Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedShipments.map((shipment) => (
                <TableRow 
                  key={shipment.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  onClick={() => router.push(`/supply-chain/shipments/${shipment.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-gray-400" />
                      {shipment.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-400" />
                      <div>
                        <div>{shipment.carrier}</div>
                        <div className="text-xs text-gray-500">{shipment.trackingNumber}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{shipment.origin}</TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                  <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(shipment.estimatedDelivery)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedShipments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Truck className="h-8 w-8 mb-2" />
                      <p>No shipments found matching your search criteria</p>
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
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-full dark:bg-blue-900/20">
              <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Shipments</p>
              <h3 className="text-xl font-bold">
                {shipments.filter(shipment => shipment.status === 'in-transit').length}
              </h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-full dark:bg-emerald-900/20">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered This Month</p>
              <h3 className="text-xl font-bold">
                {shipments.filter(shipment => shipment.status === 'delivered').length}
              </h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-full dark:bg-purple-900/20">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">On-Time Delivery Rate</p>
              <h3 className="text-xl font-bold">95%</h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 