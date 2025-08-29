import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CompanyRegisterForm from '../../components/company/CompanyRegisterForm';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CompanyRegister = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Check if user is a recruiter
  if (user?.user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Truy cập bị từ chối
            </h2>
            <p className="text-gray-600 mb-6">
              Chỉ có nhà tuyển dụng mới có thể đăng ký thông tin công ty.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Quay lại Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-medium text-gray-900">
                Đăng ký thông tin công ty
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <CompanyRegisterForm />
      </div>
    </div>
  );
};

export default CompanyRegister;
