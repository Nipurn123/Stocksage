'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  RefreshCcw, 
  FileDown, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Filter,
  Package
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

// Mock data for demo purposes
const suppliers = [
  {
    id: 1,
    name: 'Yarn Spinners Ltd.',
    contactName: 'Rahul Desai',
    email: 'rahul@yarnspinners.com',
    phone: '+91 98765 43210',
    location: 'Ahmedabad, Gujarat',
    rating: 4.8,
    totalSpent: 135000,
    itemsSupplied: ['Cotton Yarn', 'Silk Yarn', 'Wool'],
    tags: ['yarn', 'raw materials'],
    status: 'active'
  },
  {
    id: 2,
    name: 'Cotton Weavers Co.',
    contactName: 'Priya Mehta',
    email: 'priya@cottonweavers.com',
    phone: '+91 87654 32109',
    location: 'Surat, Gujarat',
    rating: 4.5,
    totalSpent: 218000,
    itemsSupplied: ['Raw Cotton', 'Processed Cotton'],
    tags: ['cotton', 'raw materials'],
    status: 'active'
  },
  {
    id: 3,
    name: 'Dye Solutions Inc.',
    contactName: 'Amit Sharma',
    email: 'amit@dyesolutions.com',
    phone: '+91 76543 21098',
    location: 'Mumbai, Maharashtra',
    rating: 4.2,
    totalSpent: 76500,
    itemsSupplied: ['Natural Dyes', 'Chemical Dyes', 'Fixatives'],
    tags: ['dyes', 'chemicals'],
    status: 'active'
  },
  {
    id: 4,
    name: 'Textile Machines Ltd.',
    contactName: 'Vikram Singh',
    email: 'vikram@textilemachines.com',
    phone: '+91 65432 10987',
    location: 'Pune, Maharashtra',
    rating: 4.7,
    totalSpent: 423000,
    itemsSupplied: ['Looms', 'Spinning Machines', 'Weaving Tools'],
    tags: ['equipment', 'machinery'],
    status: 'active'
  },
  {
    id: 5,
    name: 'Handloom Artisans',
    contactName: 'Kavita Reddy',
    email: 'kavita@handloomartisans.com',
    phone: '+91 54321 09876',
    location: 'Jaipur, Rajasthan',
    rating: 4.9,
    totalSpent: 98000,
    itemsSupplied: ['Handcrafted Fabrics', 'Traditional Designs'],
    tags: ['handloom', 'artisanal'],
    status: 'inactive'
  }
];

export default function SuppliersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(
    supplier => 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.itemsSupplied.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Render rating stars
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    return (
      <div className="flex items-center">
        <span className="mr-1">{rating.toFixed(1)}</span>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${
                i < fullStars
                  ? 'text-yellow-400 fill-yellow-400'
                  : i === fullStars && hasHalfStar
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your textile material suppliers and partners
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
          <Button variant="primary" onClick={() => router.push('/supply-chain/suppliers/add')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={16} />
          <span>Filter</span>
        </Button>
      </div>
      
      {/* Suppliers List */}
      <Card>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Items Supplied</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSuppliers.map((supplier) => (
                <TableRow 
                  key={supplier.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  onClick={() => router.push(`/supply-chain/suppliers/${supplier.id}`)}
                >
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{supplier.contactName}</div>
                      <div className="flex items-center text-gray-500 gap-2 mt-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-xs">{supplier.email}</span>
                      </div>
                      <div className="flex items-center text-gray-500 gap-2">
                        <Phone className="h-3 w-3" />
                        <span className="text-xs">{supplier.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{supplier.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {supplier.itemsSupplied.map((item, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{renderRating(supplier.rating)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={supplier.status === 'active' ? 'success' : 'secondary'}
                      className="capitalize"
                    >
                      {supplier.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedSuppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Package className="h-8 w-8 mb-2" />
                      <p>No suppliers found matching your search criteria</p>
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
    </div>
  );
} 