import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { cn } from '@/lib/utils';
import DashboardHeader from '@/components/DashboardHeader';
import CompactSidebar from '@/components/CompactSidebar';
import AIChatbot from '@/components/common/AIChatbot';
import CompanyRegisterForm from '@/components/company/CompanyRegisterForm';
import { fetchUser } from '@/redux/authSlice';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const { user, isInitializing: isAuthInitializing } = useSelector((state) => state.auth);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);

  const toggleSidebarPin = () => {
    setIsSidebarPinned(prev => !prev);
  };

  // The user object from Redux now contains the profile with company info
  const hasCompany = !!user?.profile?.company;
  
  // The registration form will now dispatch the fetchUser action on success
  const handleRegistrationSuccess = () => {
    dispatch(fetchUser());
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
      {!isAuthInitializing && !hasCompany && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl">
            <CompanyRegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
          </div>
        </div>
      )}

      {/* The main loading spinner is now handled by the AppRouter */}
    </div>
  );
};

export default DashboardLayout;
