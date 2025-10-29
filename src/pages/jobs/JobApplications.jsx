import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as applicationService from '@/services/applicationService';
import * as jobService from '@/services/jobService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, User, Mail, Phone, Download, Search, MoreHorizontal, Eye, Users } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [meta, setMeta] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    search: '',
    sort: '-appliedAt',
    candidateRating: 'all',
    isReapplied: 'all',
  });

  const fetchJobAndApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = { ...filters };
      if (apiFilters.status === 'all') delete apiFilters.status;
      if (apiFilters.candidateRating === 'all') delete apiFilters.candidateRating;
      if (apiFilters.isReapplied === 'all') delete apiFilters.isReapplied;
      
      const [jobResponse, appsResponse] = await Promise.all([
        jobService.getJobById(jobId),
        applicationService.getJobApplications(jobId, apiFilters),
      ]);
      setJob(jobResponse.data);
      setApplications(appsResponse.data);
      setMeta(appsResponse.meta);
    } catch (err) {
      console.error("Error fetching data:", err);
      const errorMessage = err.response?.data?.message || 'Không thể tải dữ liệu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobId, filters]);

  useEffect(() => {
    fetchJobAndApplications();
  }, [fetchJobAndApplications]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    handleFilterChange('search', searchTerm);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedApplications(applications.map(app => app._id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (applicationId) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  const handleExport = async () => {
    if (selectedApplications.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ứng viên');
      return;
    }

    try {
      const response = await applicationService.exportApplications(selectedApplications);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-${job?.title || 'export'}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Đã xuất CSV thành công');
      setSelectedApplications([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xuất CSV');
    }
  };

  const handleCompare = () => {
    if (selectedApplications.length < 2) {
      toast.error('Vui lòng chọn ít nhất 2 ứng viên để so sánh');
      return;
    }
    if (selectedApplications.length > 5) {
      toast.error('Chỉ có thể so sánh tối đa 5 ứng viên');
      return;
    }

    navigate('/candidates/compare', { 
      state: { applicationIds: selectedApplications } 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      REVIEWING: { label: 'Đang xem xét', className: 'bg-blue-100 text-blue-800' },
      SCHEDULED_INTERVIEW: { label: 'Đã lên lịch PV', className: 'bg-cyan-100 text-cyan-800' },
      INTERVIEWED: { label: 'Đã phỏng vấn', className: 'bg-purple-100 text-purple-800' },
      ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return <ApplicationListSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={fetchJobAndApplications} message={error} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link to={`/jobs/recruiter/${jobId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại chi tiết
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách ứng viên cho vị trí: {job?.title || '...'}</CardTitle>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Tìm kiếm theo tên, email, SĐT..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Tìm kiếm</Button>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
                <SelectItem value="SCHEDULED_INTERVIEW">Đã lên lịch PV</SelectItem>
                <SelectItem value="INTERVIEWED">Đã phỏng vấn</SelectItem>
                <SelectItem value="ACCEPTED">Đã chấp nhận</SelectItem>
                <SelectItem value="REJECTED">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="-appliedAt">Ngày nộp (mới nhất)</SelectItem>
                    <SelectItem value="appliedAt">Ngày nộp (cũ nhất)</SelectItem>
                    <SelectItem value="-lastStatusUpdateAt">Cập nhật (mới nhất)</SelectItem>
                    <SelectItem value="lastStatusUpdateAt">Cập nhật (cũ nhất)</SelectItem>
                </SelectContent>
            </Select>
            <Select value={filters.candidateRating} onValueChange={(value) => handleFilterChange('candidateRating', value)}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Lọc theo đánh giá" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả đánh giá</SelectItem>
                    <SelectItem value="NOT_RATED">Chưa đánh giá</SelectItem>
                    <SelectItem value="NOT_SUITABLE">Không phù hợp</SelectItem>
                    <SelectItem value="MAYBE">Có thể</SelectItem>
                    <SelectItem value="SUITABLE">Phù hợp</SelectItem>
                    <SelectItem value="PERFECT_MATCH">Rất phù hợp</SelectItem>
                </SelectContent>
            </Select>
            <Select value={filters.isReapplied} onValueChange={(value) => handleFilterChange('isReapplied', value)}>
                <SelectTrigger className="w-48">
                    <SelectValue placeholder="Lọc theo ứng tuyển lại" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="true">Đã ứng tuyển lại</SelectItem>
                    <SelectItem value="false">Chưa ứng tuyển lại</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions Toolbar */}
          {selectedApplications.length > 0 && (
            <Card className="mb-4 bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Đã chọn {selectedApplications.length} ứng viên
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Xuất CSV
                    </Button>

                    <Button 
                      variant="default"
                      onClick={handleCompare}
                      disabled={selectedApplications.length < 2}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      So sánh ({selectedApplications.length})
                    </Button>

                    <Button variant="ghost" onClick={() => setSelectedApplications([])}>
                      Bỏ chọn
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {applications.length === 0 ? (
            <EmptyState message="Chưa có ứng viên nào cho vị trí này." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedApplications.length === applications.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Ứng viên</TableHead>
                    <TableHead>Thông tin liên hệ</TableHead>
                    <TableHead>Ngày nộp</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow 
                      key={app._id} 
                      className="hover:bg-gray-50"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedApplications.includes(app._id)}
                          onCheckedChange={() => handleSelectApplication(app._id)}
                        />
                      </TableCell>
                      <TableCell 
                        onClick={() => navigate(`/jobs/${jobId}/applications/${app._id}`)}
                        className="cursor-pointer"
                      >
                        <div className="font-medium">{app.candidateName}</div>
                      </TableCell>
                      <TableCell 
                        onClick={() => navigate(`/jobs/${jobId}/applications/${app._id}`)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" /> {app.candidateEmail}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Phone className="h-4 w-4" /> {app.candidatePhone}
                        </div>
                      </TableCell>
                      <TableCell 
                        onClick={() => navigate(`/jobs/${jobId}/applications/${app._id}`)}
                        className="cursor-pointer"
                      >{utils.formatDate(app.appliedAt)}</TableCell>
                      <TableCell 
                        onClick={() => navigate(`/jobs/${jobId}/applications/${app._id}`)}
                        className="cursor-pointer"
                      >{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                              <a href={app.submittedCV.path} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-2 h-4 w-4" />
                                Xem CV
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild onClick={(e) => e.stopPropagation()}>
                              <a href={app.submittedCV.path} download>
                                <Download className="mr-2 h-4 w-4" />
                                Tải xuống
                              </a>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination */}
              {meta.totalPages > 1 && (
                 <div className="flex items-center justify-between pt-4">
                 <p className="text-sm text-gray-600">
                   Hiển thị {((meta.currentPage - 1) * meta.limit) + 1} -{' '}
                   {Math.min(meta.currentPage * meta.limit, meta.totalItems)} trong tổng số{' '}
                   {meta.totalItems} ứng viên
                 </p>
                 <div className="flex items-center gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                     disabled={meta.currentPage === 1}
                     onClick={() => handlePageChange(meta.currentPage - 1)}
                   >
                     Trước
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     disabled={meta.currentPage === meta.totalPages}
                     onClick={() => handlePageChange(meta.currentPage + 1)}
                   >
                     Sau
                   </Button>
                 </div>
               </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ApplicationListSkeleton = () => (
    <div className="max-w-7xl mx-auto p-4">
        <div className="mb-6">
            <Skeleton className="h-9 w-48" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2 mb-4" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-full max-w-sm" />
                    <Skeleton className="h-10 w-48" />
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-40" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-5 w-20" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-9 w-24" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
);


export default JobApplications;
