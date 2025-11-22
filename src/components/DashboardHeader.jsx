import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const DashboardHeader = () => {

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6">
      {/* Search Bar */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-4 py-2 w-full max-w-md bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>
      </div>
    </header >
  );
};

export default DashboardHeader;
