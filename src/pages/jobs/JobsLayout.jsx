import { Outlet } from 'react-router-dom';
import ModuleTabs from '@/components/common/ModuleTabs';

const jobTabs = [
  { to: '', label: 'Danh sách' },
  { to: '/create', label: 'Tạo mới' },
  { to: '/archived', label: 'Đã ẩn' },
];

const JobsLayout = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Tin Tuyển Dụng</h1>
        <p className="text-gray-600 mt-1">Tạo và quản lý các vị trí tuyển dụng của bạn.</p>
      </div>
      <ModuleTabs tabs={jobTabs} basePath="/jobs" />
      <div className="pt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default JobsLayout;
