import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  MessageCircle,
  User,
  Search,
  Coins,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleChatClick = () => {
    window.open('/messaging', '_blank');
  };

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

      {/* Right side icons */}
      <div className="flex items-center gap-4 ml-auto">
        <Button onClick={handleChatClick} variant="outline" size="icon" className="relative">
          <MessageCircle className="h-5 w-5" />
            <span className="sr-only">Tin nhắn</span>
            <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs" variant="destructive">3</Badge>
          </Button>

          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Thông báo</span>
            <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs" variant="destructive">5</Badge>
          </Button>

          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <img src="/placeholder-user.jpg" alt="User" className="h-10 w-10 rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/company-profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>Hồ sơ công ty</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
