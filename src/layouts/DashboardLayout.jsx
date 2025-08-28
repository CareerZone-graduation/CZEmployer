import { Outlet } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import * as companyService from '@/services/companyService';
import DashboardHeader from '@/components/DashboardHeader';
import CompactSidebar from '@/components/CompactSidebar';
import AIChatbot from '@/components/common/AIChatbot';
import CompanyRegisterForm from '@/components/company/CompanyRegisterForm';

const DashboardLayout = () => {
  const [hasCompany, setHasCompany] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);

  const toggleSidebarPin = () => {
    setIsSidebarPinned(prev => !prev);
  };

  const checkCompany = useCallback(async () => {
    setIsInitializing(true);
    try {
      await companyService.getMyCompany();
      setHasCompany(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setHasCompany(false);
      } else {
        console.error('Failed to check for company', error);
      }
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    checkCompany();
  }, [checkCompany]);

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
      {!isInitializing && !hasCompany && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl">
            <CompanyRegisterForm onRegistrationSuccess={checkCompany} />
          </div>
        </div>
      )}

      {/* Loading spinner overlay */}
      {isInitializing && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
