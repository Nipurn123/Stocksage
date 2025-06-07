import HydrationTest from '@/components/shared/HydrationTest';

export default function TestHydrationPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Hydration Test Page</h1>
      <p className="mb-4">
        This page demonstrates proper hydration patterns to avoid React hydration mismatches.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <HydrationTest />
        
        <div className="p-4 m-4 border rounded">
          <h3 className="text-lg font-semibold">Static Content</h3>
          <p>This content is the same on both server and client renders.</p>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">Implementation Details</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Uses the <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">ThemeProvider</code> with proper hydration</li>
          <li>DOM manipulation only occurs after hydration is complete</li>
          <li>The <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">hydrated</code> class is never added to prevent mismatches</li>
          <li>Uses <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">safeDOM</code> utilities for all client-side class manipulations</li>
        </ul>
      </div>
    </div>
  );
} 