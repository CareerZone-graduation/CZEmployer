import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as companyService from '@/services/companyService';
import * as authService from '@/services/authService';
import CompanyRegisterForm from '@/components/company/CompanyRegisterForm';
import { Link } from 'react-router-dom';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [hasCompany, setHasCompany] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const checkCompany = useCallback(async () => {
    if (!isAuthenticated) {
      setIsInitializing(false);
      return;
    }
    setIsInitializing(true);
    try {
      // First, get user data
      const userResponse = await authService.getMe();
      setUser(userResponse.data);
      
      // Then, check for a company
      await companyService.getMyCompany();
      setHasCompany(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setHasCompany(false);
      } else {
        console.error("Failed to fetch initial data on home page", error);
      }
    } finally {
      setIsInitializing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkCompany();
  }, [checkCompany]);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-green-700">CareerZone</div>
            <nav className="space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-green-700">Dashboard</Link>
                  <span className="text-gray-600">Welcome, {user?.name || 'User'}!</span>
                </>
              ) : (
                <>
                  <Link to="/auth/login" className="text-gray-600 hover:text-green-700">Login</Link>
                  <Link to="/auth/register" className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800">Register</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800">Find Your Next Career Opportunity</h1>
        <p className="mt-4 text-lg text-center text-gray-600">The best place for recruiters and candidates to connect.</p>
        {/* Add more marketing content here */}
      </main>

      {isAuthenticated && !isInitializing && !hasCompany && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl">
            <CompanyRegisterForm />
          </div>
        </div>
      )}

      {isAuthenticated && isInitializing && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default Home;
