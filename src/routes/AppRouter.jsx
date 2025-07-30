import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Pages
import Home from '@/pages/Home';
import Messaging from '@/pages/Messaging';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import CompanyProfile from '@/pages/CompanyProfile';
import Jobs from '@/pages/Jobs';
import JobList from '@/pages/jobs/JobList';
import CreateJob from '@/pages/jobs/CreateJob';
import ArchivedJobs from '@/pages/jobs/ArchivedJobs';
import Notifications from '@/pages/Notifications';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Placeholder cho các trang chưa được tạo
const PlaceholderPage = ({ title }) => (
  <div className="text-center">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-muted-foreground">Trang này đang được xây dựng.</p>
  </div>
);

// Component để bảo vệ các route yêu cầu đăng nhập
const ProtectedRoute = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
};

const AppRouter = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  // Hiển thị màn hình tải trong khi kiểm tra trạng thái đăng nhập
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* --- THAY ĐỔI CHÍNH Ở ĐÂY --- */}
      {/* Route gốc '/': Nếu đã đăng nhập thì vào dashboard, nếu chưa thì hiển thị trang Home */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />}
      />

      {/* Route xác thực: /auth/login, /auth/register */}
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthLayout />}
      >
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route index element={<Navigate to="login" replace />} />
      </Route>

      {/* Các route được bảo vệ bên trong DashboardLayout */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="company-profile" element={<CompanyProfile />} />
          <Route path="billing" element={<PlaceholderPage title="Thanh toán & Hóa đơn" />} />
          
          {/* Module Jobs với các tab */}
          <Route path="jobs" element={<Jobs />}>
            <Route index element={<JobList />} />
            <Route path="create" element={<CreateJob />} />
            <Route path="archived" element={<ArchivedJobs />} />
          </Route>

          <Route path="candidates" element={<PlaceholderPage title="Quản lý Ứng viên" />} />
          <Route path="interviews" element={<PlaceholderPage title="Lịch phỏng vấn" />} />
          <Route path="reviews" element={<PlaceholderPage title="Đánh giá Ứng viên" />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Route nhắn tin độc lập (cũng được bảo vệ) */}
      <Route
        path="/messaging"
        element={isAuthenticated ? <Messaging /> : <Navigate to="/auth/login" replace />}
      />

      {/* Route 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
