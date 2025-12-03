import { Outlet } from 'react-router-dom';
import ModuleTabs from '@/components/common/ModuleTabs';

const jobTabs = [
  { to: '', label: 'Danh sách' },
  { to: '/create', label: 'Tạo mới' },
  { to: '/archived', label: 'Chờ duyệt' },
];

const JobsLayout = () => {
  return (
    <div className="space-y-4">
      <ModuleTabs tabs={jobTabs} basePath="/jobs" />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default JobsLayout;
