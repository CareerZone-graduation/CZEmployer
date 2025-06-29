import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Building, Mail, Phone, Link as LinkIcon, MapPin, User, FileText, Tag, Users, Globe } from 'lucide-react';

import * as companyService from '@/services/companyService';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ErrorState from '@/components/common/ErrorState';

const CompanyProfile = () => {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await companyService.getMyCompany();
      if (response && response.data) {
        setCompany(response.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Không thể tải thông tin công ty.";
      setError(new Error(errorMessage));
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyProfile();
  }, [fetchCompanyProfile]);

  if (isLoading) {
    return <CompanyProfileSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={fetchCompanyProfile} message={error.message} />;
  }

  if (!company) {
    return <div>Không tìm thấy thông tin công ty.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-start md:space-x-6 space-y-4 md:space-y-0">
          <Avatar className="h-24 w-24 border">
            <AvatarImage src={company.logo} alt={company.name} />
            <AvatarFallback><Building /></AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-3xl font-bold">{company.name}</CardTitle>
              {company.verified && <Badge className="bg-green-500 text-white">Đã xác thực</Badge>}
            </div>
            <CardDescription className="mt-2 text-lg">{company.industry}</CardDescription>
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center mt-2">
              <Globe className="mr-2 h-4 w-4" />
              {company.website}
            </a>
          </div>
          <Button>Chỉnh sửa</Button>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-gray-700">
            <p>{company.about}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard title="Thông tin liên hệ">
          <InfoItem icon={Mail} label="Email" value={company.contactInfo.email} />
          <InfoItem icon={Phone} label="Điện thoại" value={company.contactInfo.phone} />
          <InfoItem icon={MapPin} label="Địa chỉ" value={`${company.address.street}, ${company.address.city}, ${company.address.country}`} />
        </InfoCard>
        <InfoCard title="Thông tin pháp lý">
          <InfoItem icon={User} label="Người đại diện" value={company.representativeName} />
          <InfoItem icon={FileText} label="Mã số thuế" value={company.taxCode} />
          <InfoItem icon={LinkIcon} label="Giấy phép kinh doanh" value={<a href={company.businessRegistrationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Xem tài liệu</a>} />
        </InfoCard>
      </div>
    </div>
  );
};

const InfoCard = ({ title, children }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
);

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start">
    <Icon className="h-5 w-5 text-gray-500 mt-1 mr-4 flex-shrink-0" />
    <div>
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-gray-600">{value}</p>
    </div>
  </div>
);

const CompanyProfileSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-start md:space-x-6 space-y-4 md:space-y-0">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
        </div>
        <Skeleton className="h-10 w-24" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default CompanyProfile;
