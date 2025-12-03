import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as jobService from '@/services/jobService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Briefcase, MapPin, Calendar, DollarSign, Clock, Building, Users, Edit, Trash2, Search, Power } from 'lucide-react';

import JobForm from '@/components/jobs/JobForm';
import JobListSkeleton from '@/components/common/JobListSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

const JobList = () => {
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'ACTIVE',
    sortBy: 'createdAt:desc',
    search: '',
  });

  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = {
        ...filters,
        status: filters.status === 'all' ? '' : filters.status,
      };
      const response = await jobService.getMyJobs(apiFilters);

      // Handle both response formats: {data: [...], meta: {...}} or just the array
      if (response && response.data) {
        // Standard API response with data and meta
        setJobs(Array.isArray(response.data) ? response.data : []);
        setMeta(response.meta || {
          currentPage: 1,
          totalPages: 1,
          totalItems: Array.isArray(response.data) ? response.data.length : 0,
          limit: filters.limit
        });
      } else if (Array.isArray(response)) {
        // Direct array response (legacy format)
        setJobs(response);
        setMeta({
          currentPage: 1,
          totalPages: 1,
          totalItems: response.length,
          limit: filters.limit
        });
      } else {
        // Empty or invalid response
        setJobs([]);
        setMeta({
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          limit: filters.limit
        });
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      const errorMessage = err.response?.data?.message || 'Không thể tải danh sách công việc.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);


  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const handleSearch = () => {
    handleFilterChange('search', searchTerm);
  };

  const handlePageChange = useCallback((newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const handleEditJob = useCallback((job) => {
    navigate(`/jobs/recruiter/${job._id}`);
  }, [navigate]);

  const handleDeleteClick = (jobId) => {
    setSelectedJobId(jobId);
    setIsAlertOpen(true);
  };

  const handleDeleteJob = async () => {
    if (!selectedJobId) return;
    try {
      await jobService.deleteJob(selectedJobId);
      toast.success('Xóa tin tuyển dụng thành công!');
      fetchJobs(); // Refresh the list
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể xóa tin tuyển dụng.';
      toast.error(errorMessage);
    } finally {
      setIsAlertOpen(false);
      setSelectedJobId(null);
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await jobService.updateJob(job._id, { status: newStatus });
      toast.success(`Đã ${newStatus === 'ACTIVE' ? 'mở lại' : 'đóng'} tin tuyển dụng thành công!`);
      fetchJobs();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật trạng thái tin tuyển dụng.';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (job) => {
    if (job.moderationStatus === 'PENDING') {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Chờ duyệt
        </Badge>
      );
    }

    const statusConfig = {
      ACTIVE: { label: 'Đang tuyển dụng', variant: 'default', className: 'bg-green-100 text-green-800' },
      INACTIVE: { label: 'Ngừng tuyển dụng', variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
      EXPIRED: { label: 'Hết hạn nộp', variant: 'outline', className: 'bg-red-50 text-red-600 border-red-200' },
    };
    const config = statusConfig[job.status] || statusConfig.ACTIVE;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getWorkTypeBadge = (workType) => {
    const workTypeLabels = {
      ON_SITE: 'Tại văn phòng',
      REMOTE: 'Từ xa',
      HYBRID: 'Linh hoạt',
    };
    return workTypeLabels[workType] || workType;
  };

  return (
    <div>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <Input
                placeholder="Tìm kiếm theo tiêu đề, kỹ năng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10"
              />
            </div>
            <div className="w-full sm:w-auto">
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-full sm:w-40 h-10">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang tuyển dụng</SelectItem>
                  <SelectItem value="INACTIVE">Ngừng tuyển dụng</SelectItem>
                  <SelectItem value="EXPIRED">Hết hạn nộp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger className="w-full sm:w-48 h-10">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Mới nhất</SelectItem>
                  <SelectItem value="createdAt:asc">Cũ nhất</SelectItem>
                  <SelectItem value="deadline:desc">Hạn nộp gần nhất</SelectItem>
                  <SelectItem value="deadline:asc">Hạn nộp xa nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} className="h-10">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Briefcase className="h-5 w-5" />
            Danh sách Tin Tuyển Dụng ({meta.totalItems || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <JobListSkeleton count={5} />
          ) : error ? (
            <ErrorState onRetry={fetchJobs} message={error} />
          ) : jobs.length === 0 ? (
            <EmptyState message="Bạn chưa đăng tin tuyển dụng nào." />
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {job.location?.province || job.location?.city}, {job.location?.ward || job.location?.district}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Building className="h-4 w-4" />
                                <span>{getWorkTypeBadge(job.workType)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                <span>{job.type}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                                <Users className="h-4 w-4" />
                                <span>{job.totalApply || 0} ứng viên</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">{getStatusBadge(job)}</div>
                        </div>

                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{job.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {(job.minSalary || job.maxSalary) && (
                              <div className="flex items-center gap-1.5">
                                <DollarSign className="h-4 w-4" />
                                <span>
                                  {job.minSalary && job.maxSalary
                                    ? `${utils.formatCurrency(job.minSalary)} - ${utils.formatCurrency(
                                      job.maxSalary
                                    )}`
                                    : job.minSalary
                                      ? `Từ ${utils.formatCurrency(job.minSalary)}`
                                      : `Lên đến ${utils.formatCurrency(job.maxSalary)}`}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              <span>Hạn: {utils.formatDate(job.deadline)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              <span>Tạo: {utils.formatDate(job.createdAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {job.status !== 'EXPIRED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(job)}
                                className={job.status === 'ACTIVE' ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                              >
                                <Power className="h-4 w-4 mr-1" />
                                {job.status === 'ACTIVE' ? 'Đóng tin' : 'Mở lại'}
                              </Button>
                            )}
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/jobs/recruiter/${job._id}`}>Xem chi tiết</Link>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Sửa
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(job._id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-600">
                    Hiển thị {((meta.currentPage - 1) * meta.limit) + 1} -{' '}
                    {Math.min(meta.currentPage * meta.limit, meta.totalItems)} trong tổng số{' '}
                    {meta.totalItems} tin tuyển dụng
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

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, meta.currentPage - 2) + i;
                      if (pageNum > meta.totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === meta.currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

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
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tin tuyển dụng sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedJobId(null)}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default JobList;
