import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import DashboardHeader from '@/components/DashboardHeader';
import CompactSidebar from '@/components/CompactSidebar';
import AIChatbot from '@/components/common/AIChatbot';

const DashboardLayout = () => {
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const toggleSidebarPin = () => {
    setIsSidebarPinned(prev => !prev);
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <CompactSidebar isPinned={isSidebarPinned} onTogglePin={toggleSidebarPin} />
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        isSidebarPinned ? "md:ml-64" : "md:ml-16"
      )}>
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Conditional overlay for company registration */}
      {/* Conditional overlay for company registration is disabled as requested */}

      {/* The main loading spinner is now handled by the AppRouter */}
    </div>
  );
};

export default DashboardLayout;
