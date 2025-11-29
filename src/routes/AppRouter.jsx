import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Pages
import Homepage from '@/pages/Homepage';
import Messaging from '@/pages/Messaging';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import CompanyProfile from '@/pages/CompanyProfile';
import Jobs from '@/pages/Jobs';
import JobList from '@/pages/jobs/JobList';
import CreateJob from '@/pages/jobs/CreateJob';
import ArchivedJobs from '@/pages/jobs/ArchivedJobs';
import RecruiterJobDetail from '@/pages/jobs/RecruiterJobDetail';
import JobApplications from '@/pages/jobs/JobApplications';
import ApplicationDetail from '@/pages/jobs/ApplicationDetail';
import Notifications from '@/pages/notifications';
import InterviewList from '@/pages/interviews/InterviewList';
import InterviewDetail from '@/pages/interviews/InterviewDetail';
import DeviceTest from '@/components/interviews/DeviceTest';
import InterviewRoom from '@/components/interviews/InterviewRoom';
import Candidates from '@/pages/candidates/Candidates';
import CandidateComparison from '@/pages/candidates/CandidateComparison';
import CandidateProfile from '@/pages/candidates/CandidateProfile';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import CompanyRegister from '@/pages/company/CompanyRegister';
import RegistrationSuccess from '@/pages/auth/RegistrationSuccess';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import VerifyEmailPrompt from '@/pages/auth/VerifyEmailPrompt';
import TestCompanyForm from '@/pages/test/TestCompanyForm';
import CVViewer from '@/pages/CVViewer';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentFailure from '@/pages/PaymentFailure';
import BillingPage from '@/pages/Billing';

// Support Request Pages
import SupportRequestsPage from '@/pages/support/SupportRequestsPage';
import CreateSupportRequestPage from '@/pages/support/CreateSupportRequestPage';
import SupportRequestDetailPage from '@/pages/support/SupportRequestDetailPage';

// Settings Page
import SettingsPage from '@/pages/settings/SettingsPage';

// Placeholder cho các trang chưa được tạo
const PlaceholderPage = ({ title }) => (
  <div className="text-center">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-muted-foreground">Trang này đang được xây dựng.</p>
  </div>
);

// Component để bảo vệ các route yêu cầu đăng nhập
const ProtectedRoute = ({ isAuthenticated, isEmailVerified }) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  // Nếu đã đăng nhập nhưng chưa xác thực email, chuyển hướng đến trang yêu cầu xác thực
  if (!isEmailVerified) {
    return <Navigate to="/verify-prompt" replace />;
  }
  return <Outlet />;
};

import { shallowEqual } from 'react-redux';

const AppRouter = () => {
  // Use shallowEqual to prevent re-renders when the user object changes
  const { isAuthenticated, isInitializing, isEmailVerified } = useSelector(
    (state) => ({
      isAuthenticated: state.auth.isAuthenticated,
      isInitializing: state.auth.isInitializing,
      isEmailVerified: state.auth.isEmailVerified,
    }),
    shallowEqual,
  );

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
      {/* Route gốc '/': Nếu đã đăng nhập thì vào dashboard, nếu chưa thì hiển thị trang Homepage */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Homepage />}
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
      <Route
        path="/auth/forgot-password"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />}
      />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register-success" element={<RegistrationSuccess />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-prompt" element={<VerifyEmailPrompt />} />


      {/* Các route được bảo vệ bên trong DashboardLayout */}
      <Route
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} isEmailVerified={isEmailVerified} />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="company-profile" element={<CompanyProfile />} />
          <Route path="company-register" element={<CompanyRegister />} />
          <Route path="test-company-form" element={<TestCompanyForm />} />
          <Route path="billing" element={<BillingPage />} />

          {/* Module Jobs với các tab */}
          <Route path="jobs" element={<Jobs />}>
            <Route index element={<JobList />} />
            <Route path="create" element={<CreateJob />} />
            <Route path="archived" element={<ArchivedJobs />} />
          </Route>
          <Route path="jobs/recruiter/:jobId" element={<RecruiterJobDetail />} />
          <Route path="jobs/:jobId/applications" element={<JobApplications />} />
          <Route path="jobs/:jobId/applications/:applicationId" element={<ApplicationDetail />} />
          <Route path="applications/:applicationId" element={<ApplicationDetail />} />

          <Route path="candidates" element={<Candidates />} />
          <Route path="candidates/compare" element={<CandidateComparison />} />
          <Route path="candidates/:userId" element={<CandidateProfile />} />
          <Route path="interviews" element={<InterviewList />} />
          <Route path="interviews/:interviewId" element={<InterviewDetail />} />
          <Route path="messaging" element={<Messaging />} />
          <Route path="reviews" element={<PlaceholderPage title="Đánh giá Ứng viên" />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="cv-viewer" element={<CVViewer />} />

          {/* Support Request Routes */}
          <Route path="support" element={<SupportRequestsPage />} />
          <Route path="support/new" element={<CreateSupportRequestPage />} />
          <Route path="support/:id" element={<SupportRequestDetailPage />} />

          {/* Settings Route */}
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Interview room routes - no layout for full-screen experience */}
        <Route path="/interviews/:interviewId/device-test" element={<DeviceTest />} />
        <Route path="/interviews/:interviewId/room" element={<InterviewRoom />} />
      </Route>

      {/* Payment routes */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failure" element={<PaymentFailure />} />



      {/* Route 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
