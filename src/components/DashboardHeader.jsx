import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { logoutSuccess } from '@/redux/authSlice';
import { clearNotifications } from '@/redux/notificationSlice';
import { logoutServer } from '@/services/authService';
import socketService from '@/services/socketService';
import NotificationDropdown from '@/components/NotificationDropdown';
const DashboardHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const coinBalance = user?.user?.coinBalance ?? 0;
  const handleLogout = async () => {
    try {
      await logoutServer();
    } catch (error) {
      console.error('Server logout failed:', error);
    } finally {
      socketService.disconnect();
      dispatch(clearNotifications());
      dispatch(logoutSuccess());
    }
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center gap-2 border-r pr-4 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md transition-colors"
                onClick={() => navigate('/billing')}
              >
                <Coins className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{coinBalance.toLocaleString()}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1 text-xs">
                <p className="font-semibold">Số dư xu của bạn</p>
                <p className="text-gray-600">Sử dụng xu để:</p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                  <li>Đăng tin tuyển dụng (100 xu/tin)</li>
                  <li>Xem thông tin ứng viên</li>
                  <li>Mở khóa CV</li>
                </ul>
                <p className="text-blue-600 font-semibold pt-1">Nhấn để nạp thêm xu</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>


        <NotificationDropdown />

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
      </div >
    </header >
  );
};

export default DashboardHeader;
