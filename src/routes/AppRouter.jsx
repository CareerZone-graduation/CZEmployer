import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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

// A simple placeholder for pages that are not yet created
const PlaceholderPage = ({ title }) => (
  <div className="text-center">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-muted-foreground">This page is under construction.</p>
  </div>
);

const ProtectedRoute = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return <Outlet />;
};

const AppRouter = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Home Route */}
      <Route path="/" element={<Home />} />

      {/* Authentication Routes */}
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthLayout />}
      >
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route index element={<Navigate to="login" replace />} />
      </Route>

      {/* Protected Dashboard Layout Route */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="company-profile" element={<CompanyProfile />} />
          <Route path="billing" element={<PlaceholderPage title="Billing & Payments" />} />
          
          {/* Jobs Module with Tabs */}
          <Route path="jobs" element={<Jobs />}>
            <Route index element={<JobList />} />
            <Route path="create" element={<CreateJob />} />
            <Route path="archived" element={<ArchivedJobs />} />
          </Route>

          <Route path="candidates" element={<PlaceholderPage title="Candidate Management" />} />
          <Route path="interviews" element={<PlaceholderPage title="Interview Schedule" />} />
          <Route path="reviews" element={<PlaceholderPage title="Candidate Reviews" />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Standalone Messaging Route (also protected) */}
      <Route
        path="/messaging"
        element={isAuthenticated ? <Messaging /> : <Navigate to="/auth/login" replace />}
      />

      {/* 404 Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
