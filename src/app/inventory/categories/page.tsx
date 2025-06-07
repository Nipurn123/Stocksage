'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Modal,
  Label
} from '@/components/ui';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/Table';
import {
  Search,
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Sample data for demonstration
const SAMPLE_CATEGORIES = [
  {
    id: '1',
    name: 'Clothing',
    description: 'Apparel products including shirts, pants, and accessories',
    productsCount: 24,
    createdAt: '2023-01-15T12:00:00Z',
  },
  {
    id: '2',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    productsCount: 15,
    createdAt: '2023-01-20T12:00:00Z',
  },
  {
    id: '3',
    name: 'Home Goods',
    description: 'Products for home use and decoration',
    productsCount: 30,
    createdAt: '2023-02-05T12:00:00Z',
  },
  {
    id: '4',
    name: 'Office Supplies',
    description: 'Stationery and office equipment',
    productsCount: 18,
    createdAt: '2023-02-10T12:00:00Z',
  },
  {
    id: '5',
    name: 'Sports & Outdoors',
    description: 'Equipment for sports and outdoor activities',
    productsCount: 12,
    createdAt: '2023-03-01T12:00:00Z',
  }
];

interface Category {
  id: string;
  name: string;
  description: string;
  productsCount: number;
  createdAt: string;
}

export default function CategoriesPage() {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // In a real scenario, this would be a fetch from your API
        // const response = await fetch('/api/inventory/categories');
        // const data = await response.json();
        // setCategories(data);
        
        // Using sample data for demonstration
        setCategories(SAMPLE_CATEGORIES);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      const filtered = categories.filter(
        category => 
          category.name.toLowerCase().includes(lowercaseSearchTerm) || 
          category.description.toLowerCase().includes(lowercaseSearchTerm)
      );
      setFilteredCategories(filtered);
    }
  }, [categories, searchTerm]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Open dialog for creating new category
  const handleOpenCreateDialog = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setCategoryForm({
      name: '',
      description: ''
    });
    setIsDialogOpen(true);
  };
  
  // Open dialog for editing category
  const handleOpenEditDialog = (category: Category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description
    });
    setIsDialogOpen(true);
  };
  
  // Open dialog for delete confirmation
  const handleOpenDeleteDialog = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };
  
  // Save category (create or update)
  const handleSaveCategory = async () => {
    try {
      // Validation
      if (!categoryForm.name.trim()) {
        toast.error('Category name is required');
        return;
      }
      
      if (isEditing && currentCategory) {
        // Update existing category
        // In a real application, you would call an API endpoint
        // const response = await fetch(`/api/inventory/categories/${currentCategory.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(categoryForm)
        // });
        
        // Simulate API call for demo
        const updatedCategories = categories.map(cat => 
          cat.id === currentCategory.id 
            ? { ...cat, ...categoryForm } 
            : cat
        );
        
        setCategories(updatedCategories);
        toast.success('Category updated successfully');
      } else {
        // Create new category
        // In a real application, you would call an API endpoint
        // const response = await fetch('/api/inventory/categories', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(categoryForm)
        // });
        
        // Simulate API call for demo
        const newCategory: Category = {
          id: Date.now().toString(),
          name: categoryForm.name,
          description: categoryForm.description,
          productsCount: 0,
          createdAt: new Date().toISOString()
        };
        
        setCategories([...categories, newCategory]);
        toast.success('Category created successfully');
      }
      
      // Close dialog and reset form
      setIsDialogOpen(false);
      setCategoryForm({
        name: '',
        description: ''
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };
  
  // Delete category
  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    
    try {
      // In a real application, you would call an API endpoint
      // await fetch(`/api/inventory/categories/${currentCategory.id}`, {
      //   method: 'DELETE'
      // });
      
      // Simulate API call for demo
      const updatedCategories = categories.filter(cat => cat.id !== currentCategory.id);
      setCategories(updatedCategories);
      
      toast.success('Category deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search categories..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleOpenCreateDialog}
            className="w-full md:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </Card>
      
      {/* Categories List */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Product Categories</h3>
          <div className="text-sm text-gray-500">
            {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No categories match your search criteria' : 'No categories found. Create your first category!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">{category.description}</TableCell>
                    <TableCell className="text-center">{category.productsCount}</TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDeleteDialog(category)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
      
      {/* Create/Edit Category Modal */}
      <Modal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={isEditing ? 'Edit Category' : 'Create New Category'}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              {isEditing ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter category name"
              value={categoryForm.name}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Enter category description"
              value={categoryForm.description}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Category"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary"
              className="bg-red-500 hover:bg-red-600 text-white" 
              onClick={handleDeleteCategory}
            >
              Delete Category
            </Button>
          </div>
        }
      >
        {currentCategory && (
          <div className="py-2">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Warning</p>
                <p className="text-sm">
                  This will permanently delete the category "{currentCategory.name}".
                  {currentCategory.productsCount > 0 && (
                    ` ${currentCategory.productsCount} products will be uncategorized.`
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 