import { Outlet, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Building2,
  CreditCard,
  Home,
  Menu,
  Briefcase,
  Users,
  CalendarCheck,
  Star,
} from 'lucide-react';

import * as companyService from '@/services/companyService';
import DashboardHeader from '@/components/DashboardHeader';
import CompactSidebar from '@/components/CompactSidebar';
import AIChatbot from '@/components/common/AIChatbot';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import CompanyRegisterForm from '@/components/company/CompanyRegisterForm';
import { cn } from '@/lib/utils';

const mainNavLinks = [
  { 
    href: '/', 
    label: 'Dashboard', 
    icon: <Home className="h-5 w-5" />,
    description: 'Tổng quan hệ thống'
  },
  { 
    href: '/company-profile', 
    label: 'Quản lý công ty', 
    icon: <Building2 className="h-5 w-5" />,
    description: 'Hồ sơ và thông tin công ty'
  },
  { 
    href: '/jobs', 
    label: 'Tin tuyển dụng', 
    icon: <Briefcase className="h-5 w-5" />,
    description: 'Quản lý tin tuyển dụng'
  },
  { 
    href: '/candidates', 
    label: 'Ứng viên', 
    icon: <Users className="h-5 w-5" />,
    description: 'Quản lý ứng viên'
  },
  { 
    href: '/interviews', 
    label: 'Phỏng vấn', 
    icon: <CalendarCheck className="h-5 w-5" />,
    description: 'Lịch phỏng vấn'
  },
  { 
    href: '/billing', 
    label: 'Thanh toán', 
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Thanh toán và hóa đơn'
  },
  { 
    href: '/notifications', 
    label: 'Thông báo', 
    icon: <Bell className="h-5 w-5" />,
    description: 'Thông báo hệ thống'
  },
];

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const onToggleSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <DashboardHeader onToggleSidebar={onToggleSidebar} />
      
      <div className="flex flex-1">
        {/* Desktop Compact Sidebar */}
        <div className="hidden md:block">
          <CompactSidebar isPinned={isSidebarPinned} onTogglePin={toggleSidebarPin} />
        </div>

        {/* Mobile Sidebar using Sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <div className="md:hidden" />
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col w-72">
            <div className="flex items-center gap-2 mb-6 px-2">
              <img src="/placeholder-logo.svg" alt="CareerZone" className="h-8 w-8" />
              <span className="font-bold text-emerald-700 text-lg">CareerZone</span>
            </div>
            <nav className="grid gap-2 text-sm font-medium">
              {mainNavLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {link.icon}
                  <div>
                    <div className="font-medium">{link.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{link.description}</div>
                  </div>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 p-4 md:p-6 lg:p-8",
          isSidebarPinned ? "md:ml-64" : "md:ml-16"
        )}>
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
