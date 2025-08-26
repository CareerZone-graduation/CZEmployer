import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  CreditCard,
  Briefcase,
  Users,
  CalendarCheck,
  Star,
  Bell,
  ChevronRight,
  Pin,
  PinOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const sidebarItems = [
  { 
    href: '/', 
    label: 'Dashboard', 
    icon: Home,
    description: 'Tổng quan hệ thống'
  },
  {
    href: '/company-profile', 
    label: 'Quản lý công ty', 
    icon: Building2,
    description: 'Hồ sơ và thông tin công ty'
  },
  {
    href: '/jobs', 
    label: 'Tin tuyển dụng', 
    icon: Briefcase,
    description: 'Quản lý tin tuyển dụng'
  },
  {
    href: '/candidates', 
    label: 'Ứng viên', 
    icon: Users,
    description: 'Quản lý ứng viên'
  },
  {
    href: '/interviews', 
    label: 'Phỏng vấn', 
    icon: CalendarCheck,
    description: 'Lịch phỏng vấn'
  },
  {
    href: '/billing', 
    label: 'Thanh toán', 
    icon: CreditCard,
    description: 'Thanh toán và hóa đơn'
  },
  {
    href: '/notifications', 
    label: 'Thông báo', 
    icon: Bell,
    description: 'Thông báo hệ thống'
  },
];

const CompactSidebar = ({ isPinned, onTogglePin }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsExpanded(false);
    }
  };

  const shouldShowExpanded = isExpanded || isPinned;

  return (
    <TooltipProvider>
      <div 
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40 hidden md:block",
          shouldShowExpanded ? "w-64" : "w-16"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Pin Button - Only show when expanded */}
        {shouldShowExpanded && (
          <div className="absolute top-2 right-2 z-10">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onTogglePin}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 transition-colors",
                    isPinned 
                      ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100" 
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isPinned ? "Bỏ ghim sidebar" : "Ghim sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        <nav className="p-2 space-y-2 mt-10">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href !== '/' && location.pathname.startsWith(item.href));

            if (shouldShowExpanded) {
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                    isActive 
                      ? "bg-emerald-700 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-white" : "text-gray-600"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.label}</div>
                    <div className={cn(
                      "text-xs truncate mt-0.5",
                      isActive ? "text-emerald-100" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-white" />
                  )}
                </Link>
              );
            }

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                      isActive 
                        ? "bg-emerald-700 text-white" 
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
};

export default CompactSidebar;