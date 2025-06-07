'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui';
import { PlusCircle, Edit2, User, Check } from 'lucide-react';

type Profile = {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  isDefault?: boolean;
};

// Mock data - in a real app, this would come from an API or database
const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Main Account',
    color: 'bg-red-500',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Finance Team',
    color: 'bg-blue-500',
  },
  {
    id: '3',
    name: 'Inventory Manager',
    color: 'bg-green-500',
  },
];

export default function ProfilesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // In a real app, fetch profiles from an API
  useEffect(() => {
    // Simulate API call with mock data
    setProfiles(mockProfiles);
  }, []);
  
  const handleProfileSelect = (profileId: string) => {
    // In a real app, this would set the active profile in the user's session
    console.log(`Selected profile: ${profileId}`);
    // Then redirect to dashboard
    router.push('/dashboard');
  };
  
  const handleAddProfile = () => {
    // In a real implementation, this would open a modal or form to create a new profile
    alert('Add profile functionality would be implemented here');
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {!isEditing ? (
          <>
            <h2 className="text-2xl font-semibold text-center mb-8">Who's using StockSage?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {profiles.map((profile) => (
                <div key={profile.id} className="flex flex-col items-center">
                  <button
                    onClick={() => handleProfileSelect(profile.id)}
                    className="group focus:outline-none"
                  >
                    <div className={`w-24 h-24 rounded-md ${profile.color} flex items-center justify-center text-white mb-3 group-hover:ring-4 ring-white/30 transition-all`}>
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <User size={40} />
                      )}
                    </div>
                    <p className="text-center font-medium">{profile.name}</p>
                    {profile.isDefault && (
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center mt-1">
                        <Check size={12} className="mr-1" /> Default
                      </p>
                    )}
                  </button>
                </div>
              ))}
              
              {/* Add Profile Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleAddProfile}
                  className="w-24 h-24 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mb-3 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  <PlusCircle size={40} />
                </button>
                <p className="text-center font-medium">Add Profile</p>
              </div>
            </div>
            
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <Edit2 size={16} className="mr-2" />
                Manage Profiles
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold">Edit Profiles</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Done
              </button>
            </div>
            
            <div className="space-y-4">
              {profiles.map((profile) => (
                <Card key={profile.id} className="p-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-md ${profile.color} flex items-center justify-center text-white mr-4`}>
                      <User size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{profile.name}</h3>
                      {profile.isDefault && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <Check size={12} className="mr-1" /> Default
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        Edit
                      </button>
                      {!profile.isDefault && (
                        <button className="text-red-500 hover:text-red-700">
                          Delete
                        </button>
                      )}
                      {!profile.isDefault && (
                        <button className="text-primary-600 hover:text-primary-700">
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              <button
                onClick={handleAddProfile}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <PlusCircle size={20} className="mr-2" />
                Add New Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 