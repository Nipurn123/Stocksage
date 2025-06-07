'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Card, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { Search, Tag, Calendar as CalendarIcon, Download, Plus, Filter } from 'lucide-react';
import { format } from 'date-fns';

// Define types for our data
type DaybookEntry = {
  id: string;
  title: string;
  content: string;
  date: Date;
  tags: string[];
  userId?: string;
};

export default function DaybookPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'day' | 'list'>('day');
  const [entries, setEntries] = useState<DaybookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newEntry, setNewEntry] = useState({ title: '', content: '', tags: '' });
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state to true when the component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Fetch entries when component mounts, date changes, or search term changes
  // but only after initial mount to prevent hydration issues
  useEffect(() => {
    if (isMounted) {
      fetchEntries();
    }
  }, [date, searchTerm, isMounted]);
  
  // Filter entries based on selected date (for day view)
  const dayEntries = entries.filter(entry => 
    date && new Date(entry.date).toDateString() === date.toDateString()
  );
  
  // Function to fetch entries from the API
  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      
      // Use test API endpoint
      const response = await fetch('/api/daybook/test');
      
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      
      const data = await response.json();
      
      setEntries(data.map((entry: {
        id: string;
        title: string;
        content: string;
        date: string;
        tags: string[];
        userId?: string;
      }) => ({
        ...entry,
        date: new Date(entry.date),
      })));
    } catch (error: unknown) {
      console.error('Error fetching entries:', error);
      setError('Failed to fetch entries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDateSelect = (newDate: Date | { from: Date; to?: Date } | undefined) => {
    if (!newDate) return;
    
    // Handle the date object from the calendar
    if (newDate instanceof Date) {
      setDate(newDate);
      setView('day');
    } else if ('from' in newDate) {
      // Handle range selection if needed
      setDate(newDate.from);
      setView('day');
    }
  };
  
  const handleAddEntry = async () => {
    if (!date || !newEntry.title || !newEntry.content) return;
    
    const tags = newEntry.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    try {
      setIsLoading(true);
      
      // Use the test API endpoint for adding entries
      const response = await fetch('/api/daybook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newEntry.title,
          content: newEntry.content,
          date: date.toISOString(),
          tags,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create entry');
      }
      
      const newEntryData = await response.json();
      
      // Add the new entry to the state
      setEntries(prevEntries => [
        {
          ...newEntryData,
          date: new Date(newEntryData.date),
        },
        ...prevEntries,
      ]);
      
      // Reset the form
      setNewEntry({ title: '', content: '', tags: '' });
    } catch (err: unknown) {
      console.error('Error creating entry:', err);
      setError('Failed to create entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to export entries
  const handleExportEntries = () => {
    const exportData = entries.map(entry => ({
      id: entry.id,
      title: entry.title,
      content: entry.content,
      date: format(new Date(entry.date), 'yyyy-MM-dd'),
      tags: entry.tags.join(', '),
    }));
    
    const jsonStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    
    const exportFileDefaultName = `daybook-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // Show a simplified loading UI until client-side hydration is complete
  if (!isMounted) {
    return (
      <div className="container mx-auto py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-12">
            <Card className="p-6">
              <div className="flex justify-center items-center h-[300px]">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400">Loading daybook...</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Calendar and Controls */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          <Card className="p-4">
            <Calendar 
              mode="single" 
              selected={date} 
              onSelect={handleDateSelect}
              className="rounded-md border" 
            />
          </Card>
          
          <Card className="p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">View Options</h3>
              <Tabs defaultValue="day" onValueChange={(value) => setView(value as 'day' | 'list')}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="day">Day View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Search entries..."
                  className="pl-8 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(entries.flatMap(entry => entry.tags))).map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
              
              <Button className="w-full" onClick={handleExportEntries}>
                <Download className="h-4 w-4 mr-2" />
                Export Entries
              </Button>
            </div>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-8 lg:col-span-9">
          <Tabs value={view} onValueChange={(value) => setView(value as 'day' | 'list')}>
            <TabsContent value="day" className="mt-0">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      {date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select a date'}
                    </h2>
                  </div>
                  
                  {/* New Entry Form */}
                  <Card className="p-4 mb-6 border border-dashed">
                    <h3 className="text-lg font-medium mb-4">New Entry</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Title
                        </label>
                        <input
                          id="title"
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={newEntry.title}
                          onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Content
                        </label>
                        <textarea
                          id="content"
                          rows={4}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={newEntry.content}
                          onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Tags (comma separated)
                        </label>
                        <input
                          id="tags"
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          value={newEntry.tags}
                          onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                          placeholder="inventory, meeting, finance..."
                        />
                      </div>
                      
                      <Button 
                        onClick={handleAddEntry} 
                        disabled={isLoading || !date || !newEntry.title || !newEntry.content}
                      >
                        {isLoading ? 'Saving...' : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Entry
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                  
                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md mb-4">
                      {error}
                    </div>
                  )}
                  
                  {/* Day Entries */}
                  <div className="space-y-4">
                    {isLoading && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Loading entries...</p>
                      </div>
                    )}
                    
                    {!isLoading && dayEntries.length > 0 ? (
                      dayEntries.map(entry => (
                        <Card key={entry.id} className="p-4">
                          <h3 className="text-lg font-medium mb-2">{entry.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {entry.content}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </Card>
                      ))
                    ) : !isLoading && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No entries for this date</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add a new entry above</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">All Entries</h2>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportEntries}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  {/* Error message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-md mb-4">
                      {error}
                    </div>
                  )}
                  
                  {/* List View Entries */}
                  <div className="space-y-4">
                    {isLoading && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">Loading entries...</p>
                      </div>
                    )}
                    
                    {!isLoading && entries.length > 0 ? (
                      entries.map(entry => (
                        <Card key={entry.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium">{entry.title}</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {entry.content}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        </Card>
                      ))
                    ) : !isLoading && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">No entries found</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 