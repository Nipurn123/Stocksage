'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Calendar, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { BellRing, Calendar as CalendarIcon, FileText, Settings, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

// Sample compliance data - this would come from an API in a real app
const complianceDeadlines = [
  { id: 1, name: 'Quarterly Sales Tax Filing', dueDate: new Date(2024, 6, 31), status: 'upcoming', priority: 'high' },
  { id: 2, name: 'Annual Income Tax Return', dueDate: new Date(2024, 3, 15), status: 'completed', priority: 'high' },
  { id: 3, name: 'Business License Renewal', dueDate: new Date(2024, 8, 15), status: 'upcoming', priority: 'medium' },
  { id: 4, name: 'Employee Tax Withholding Report', dueDate: new Date(2024, 6, 15), status: 'pending', priority: 'medium' },
  { id: 5, name: 'VAT Return', dueDate: new Date(2024, 6, 20), status: 'upcoming', priority: 'high' },
];

const regulationUpdates = [
  {
    id: 1,
    title: 'New Tax Regulations 2024',
    description: 'Important changes to tax filing requirements and deadlines.',
    date: new Date(2024, 5, 10),
    category: 'Tax',
    impact: 'high',
  },
  {
    id: 2,
    title: 'Updated Financial Reporting Standards',
    description: 'Changes to financial reporting requirements for small businesses.',
    date: new Date(2024, 4, 15),
    category: 'Financial Reporting',
    impact: 'medium',
  },
  {
    id: 3,
    title: 'Privacy Policy Requirements Update',
    description: 'New requirements for handling customer data and privacy policies.',
    date: new Date(2024, 3, 22),
    category: 'Data Privacy',
    impact: 'medium',
  },
];

export default function CompliancePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  
  // Get events for the selected date
  const eventsForSelectedDate = date
    ? complianceDeadlines.filter(
        (deadline) => deadline.dueDate.toDateString() === date.toDateString()
      )
    : [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Compliance Management</h1>
          <p className="text-muted-foreground mt-1">
            Track tax deadlines, manage financial regulations, and ensure compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Compliance Calendar</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={view === 'calendar' ? 'primary' : 'outline'}
                onClick={() => setView('calendar')}
              >
                Calendar
              </Button>
              <Button
                size="sm"
                variant={view === 'list' ? 'primary' : 'outline'}
                onClick={() => setView('list')}
              >
                List
              </Button>
            </div>
          </div>

          {view === 'calendar' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (selectedDate instanceof Date) {
                    setDate(selectedDate);
                  }
                }}
                className="border rounded-md p-3"
              />
              <div>
                <h3 className="font-medium mb-2">
                  {date ? format(date, 'MMMM d, yyyy') : 'No date selected'}
                </h3>
                {eventsForSelectedDate.length > 0 ? (
                  <ul className="space-y-2">
                    {eventsForSelectedDate.map((event) => (
                      <li
                        key={event.id}
                        className="p-2 border rounded-md flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{event.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {format(event.dueDate, 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge
                          variant={
                            event.priority === 'high' ? 'danger' :
                            event.priority === 'medium' ? 'warning' : 'info'
                          }
                        >
                          {event.priority}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No compliance deadlines for this date</p>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceDeadlines.map((deadline) => (
                    <TableRow key={deadline.id}>
                      <TableCell className="font-medium">{deadline.name}</TableCell>
                      <TableCell>{format(deadline.dueDate, 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            deadline.status === 'completed' ? 'success' :
                            deadline.status === 'upcoming' ? 'primary' : 'secondary'
                          }
                        >
                          {deadline.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            deadline.priority === 'high' ? 'danger' :
                            deadline.priority === 'medium' ? 'warning' : 'info'
                          }
                        >
                          {deadline.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Compliance Alerts</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 border rounded-md bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Tax Deadline Approaching</h3>
                <p className="text-sm text-muted-foreground">
                  Quarterly Sales Tax Filing due in 7 days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-md bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Compliance Risk</h3>
                <p className="text-sm text-muted-foreground">
                  5 invoices missing tax compliance information
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-md">
              <BellRing className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Regulation Update</h3>
                <p className="text-sm text-muted-foreground">
                  New tax regulations announced for 2024
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Regulation Updates & Advisories</h2>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Updates</TabsTrigger>
            <TabsTrigger value="tax">Tax</TabsTrigger>
            <TabsTrigger value="financial">Financial Reporting</TabsTrigger>
            <TabsTrigger value="privacy">Data Privacy</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regulationUpdates.map((update) => (
                <Card key={update.id} className="p-4 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="primary">{update.category}</Badge>
                    <Badge
                      variant={
                        update.impact === 'high' ? 'danger' :
                        update.impact === 'medium' ? 'warning' : 'info'
                      }
                    >
                      {update.impact} impact
                    </Badge>
                  </div>
                  <h3 className="font-semibold mb-2">{update.title}</h3>
                  <p className="text-sm text-muted-foreground flex-grow">{update.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-muted-foreground">
                      {format(update.date, 'MMM d, yyyy')}
                    </span>
                    <Button variant="link" size="sm" className="p-0">
                      Read more
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="tax">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regulationUpdates
                .filter((update) => update.category === 'Tax')
                .map((update) => (
                  <Card key={update.id} className="p-4 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="primary">{update.category}</Badge>
                      <Badge
                        variant={
                          update.impact === 'high' ? 'danger' :
                          update.impact === 'medium' ? 'warning' : 'info'
                        }
                      >
                        {update.impact} impact
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2">{update.title}</h3>
                    <p className="text-sm text-muted-foreground flex-grow">{update.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs text-muted-foreground">
                        {format(update.date, 'MMM d, yyyy')}
                      </span>
                      <Button variant="link" size="sm" className="p-0">
                        Read more
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
          {/* Similar content for other tabs */}
        </Tabs>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tax Compliance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Sales Tax Collected</h3>
            <p className="text-2xl font-bold">$12,450.85</p>
            <p className="text-sm text-muted-foreground">Last quarter</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tax Filing Status</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">Current</p>
            <p className="text-sm text-muted-foreground">All filings up to date</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Compliance Score</h3>
            <p className="text-2xl font-bold">92%</p>
            <p className="text-sm text-muted-foreground">5% increase from last month</p>
          </Card>
        </div>
      </Card>
    </div>
  );
} 