import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  Menu,
  MessageCircle,
  User,
  Search,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { clearAccessToken } from '@/utils/token';

const DashboardHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAccessToken();
    window.location.reload();
  };

  const handleChatClick = () => {
    window.open('/messaging', '_blank');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white shadow-sm">
      <div className="flex h-16 items-center px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden mr-2"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mr-6">
          <img src="/placeholder-logo.svg" alt="CareerZone" className="h-8 w-8" />
          <span className="hidden sm:inline-block font-bold text-emerald-700 text-lg">CareerZone</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button onClick={handleChatClick} variant="ghost" size="icon" className="relative">
            <MessageCircle className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-xs bg-emerald-700">3</Badge>
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-xs bg-red-500">5</Badge>
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleLogout} variant="ghost" size="icon">
                  <LogOut className="h-5 w-5 text-red-500" />
                  <span className="sr-only">Đăng xuất</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đăng xuất</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <img src="/placeholder-user.jpg" alt="User" className="h-8 w-8 rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/company-profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ công ty</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
