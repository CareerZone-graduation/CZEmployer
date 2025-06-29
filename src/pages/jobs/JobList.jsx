import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as jobService from '@/services/jobService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, MapPin, Calendar, DollarSign, Clock, Building, Users, Edit } from 'lucide-react';

import JobForm from '@/components/jobs/JobForm';
import JobListSkeleton from '@/components/common/JobListSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

const JobList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'ACTIVE',
    sortBy: 'createdAt:desc',
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
      if (response.data) {
        setJobs(response.data);
        setMeta(response.meta || {});
      } else {
        setJobs([]);
        setMeta({});
      }
    } catch (err) {
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

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingJob(null);
    fetchJobs(); // Refetch jobs after closing dialog
  }, [fetchJobs]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const handleEditJob = useCallback((job) => {
    setEditingJob(job);
    setIsDialogOpen(true);
  }, []);

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { label: 'Đang tuyển', variant: 'default', className: 'bg-green-100 text-green-800' },
      INACTIVE: { label: 'Tạm ngưng', variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
      EXPIRED: { label: 'Hết hạn', variant: 'destructive', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || statusConfig.ACTIVE;
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
      <div className="flex items-center justify-between mb-6">
        <div />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => setEditingJob(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo Tin Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Cập nhật Tin Tuyển Dụng' : 'Tạo Tin Tuyển Dụng Mới'}</DialogTitle>
            </DialogHeader>
            <JobForm onClose={handleCloseDialog} job={editingJob} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang tuyển</SelectItem>
                  <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
                  <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sắp xếp:</label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Mới nhất</SelectItem>
                  <SelectItem value="createdAt:asc">Cũ nhất</SelectItem>
                  <SelectItem value="deadline:desc">Hạn nộp gần nhất</SelectItem>
                  <SelectItem value="deadline:asc">Hạn nộp xa nhất</SelectItem>
                  <SelectItem value="title:asc">Tên A-Z</SelectItem>
                  <SelectItem value="title:desc">Tên Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job List */}
      <Card>
        <CardHeader>
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
                                  {job.location.city}, {job.location.district}
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
                            </div>
                          </div>
                          <div className="text-right">{getStatusBadge(job.status)}</div>
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
                              <span>Tạo: {utils.formatDate(job.createdAt || job.createAt)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              Xem chi tiết
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Sửa
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
    </div>
  );
};

export default JobList;
