import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as jobService from '@/services/jobService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Briefcase, MapPin, Calendar, DollarSign, Clock, Building, Users, Search } from 'lucide-react';

import JobListSkeleton from '@/components/common/JobListSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

const ArchivedJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'PENDING', // Default to PENDING status (awaiting approval)
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
      const response = await jobService.getMyJobs(filters);

      const jobs = response?.data || [];

      setJobs(jobs);
      setMeta(response?.meta || {
        currentPage: 1,
        totalPages: 1,
        totalItems: jobs.length,
        limit: filters.limit
      });

    } catch (err) {
      console.error("Error fetching archived/pending jobs:", err);
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

  const getStatusBadge = (job) => {
    // Check if job is pending approval
    if (job.approved === false) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Chờ phê duyệt
        </Badge>
      );
    }
    
    // Check status for approved jobs
    const statusConfig = {
      INACTIVE: { label: 'Đã ẩn', variant: 'outline', className: 'bg-gray-100 text-gray-800' },
      EXPIRED: { label: 'Hết hạn', variant: 'outline', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[job.status] || { label: job.status, variant: 'default' };
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
            <Button onClick={handleSearch} className="h-10">
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Briefcase className="h-5 w-5" />
            Đã ẩn / Chờ duyệt ({meta.totalItems || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <JobListSkeleton count={3} />
          ) : error ? (
            <ErrorState onRetry={fetchJobs} message={error} />
          ) : jobs.length === 0 ? (
            <EmptyState message="Không có công việc nào đã ẩn hoặc đang chờ phê duyệt." />
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
                                    ? `${utils.formatCurrency(job.minSalary)} - ${utils.formatCurrency(job.maxSalary)}`
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
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/jobs/recruiter/${job._id}`}>Xem chi tiết</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

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

export default ArchivedJobs;
