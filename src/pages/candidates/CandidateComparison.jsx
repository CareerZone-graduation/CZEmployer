import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as applicationService from '@/services/applicationService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ErrorState from '@/components/common/ErrorState';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  MapPin,
  Eye,
  X,
  FileText
} from 'lucide-react';

const CandidateComparison = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const applicationIds = location.state?.applicationIds || [];

  useEffect(() => {
    if (!applicationIds || applicationIds.length === 0) {
      toast.error('Không có ứng viên nào được chọn để so sánh');
      navigate('/candidates');
      return;
    }

    if (applicationIds.length > 5) {
      toast.error('Chỉ có thể so sánh tối đa 5 ứng viên');
      navigate('/candidates');
      return;
    }

    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationIds]);

  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const promises = applicationIds.map(id =>
        applicationService.getApplicationById(id)
      );
      const responses = await Promise.all(promises);
      const candidatesData = responses.map(res => res.data);
      setCandidates(candidatesData);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tải thông tin ứng viên';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCandidate = (applicationId) => {
    const updatedIds = applicationIds.filter(id => id !== applicationId);
    if (updatedIds.length < 2) {
      toast.error('Cần ít nhất 2 ứng viên để so sánh');
      navigate('/candidates');
      return;
    }
    navigate('/candidates/compare', {
      state: { applicationIds: updatedIds },
      replace: true
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { label: 'Chờ xem xét', className: 'bg-yellow-100 text-yellow-800' },
      SUITABLE: { label: 'Phù hợp', className: 'bg-green-100 text-green-800' },
      SCHEDULED_INTERVIEW: { label: 'Đã lên lịch PV', className: 'bg-cyan-100 text-cyan-800' },
      OFFER_SENT: { label: 'Đã gửi đề nghị', className: 'bg-purple-100 text-purple-800' },
      ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };



  // Calculate grid columns based on number of candidates
  const getGridCols = () => {
    switch (candidates.length) {
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-2';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className={`grid ${getGridCols()} gap-4`}>
          {[...Array(applicationIds.length)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto mt-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorState message={error} onRetry={fetchCandidates} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/candidates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">So sánh ứng viên ({candidates.length})</h1>
        </div>
      </div>

      {/* Candidate Cards - Grid Layout */}
      <div className={`grid ${getGridCols()} gap-4 mb-6`}>
        {candidates.map((candidate) => (
          <Card key={candidate._id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 rounded-full"
              onClick={() => removeCandidate(candidate._id)}
            >
              <X className="h-4 w-4" />
            </Button>

            <CardHeader className="text-center pb-4">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarImage src={candidate.candidateProfileId?.avatar} />
                <AvatarFallback>
                  {candidate.candidateProfileId?.fullName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">
                {candidate.candidateProfileId?.fullName || 'N/A'}
              </CardTitle>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
                <div className="flex items-center justify-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{candidate.candidateProfileId?.email || 'N/A'}</span>
                </div>
                {candidate.candidateProfileId?.phone && (
                  <div className="flex items-center justify-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{candidate.candidateProfileId.phone}</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              <div className="text-center">
                {getStatusBadge(candidate.status)}
              </div>



              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/applications/${candidate._id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Details */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Job Information - Should be same for all */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Vị trí ứng tuyển
            </h3>
            <p className="font-medium">{candidates[0]?.jobId?.title || 'N/A'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {candidates[0]?.jobId?.company?.name || 'N/A'}
            </p>
          </div>

          {/* Comparison Table */}
          <div className="space-y-4">
            {/* Application Date */}
            <ComparisonRow
              label="Ngày ứng tuyển"
              icon={<Calendar className="h-4 w-4" />}
              values={candidates.map(c => utils.formatDateTime(c.appliedAt))}
              gridCols={getGridCols()}
            />

            {/* Expected Salary */}
            <ComparisonRow
              label="Mức lương mong muốn"
              icon={<Briefcase className="h-4 w-4" />}
              values={candidates.map(c => {
                const salary = c.candidateProfileId?.expectedSalary;
                if (!salary || !salary.min) return 'Chưa công bố';
                const min = (salary.min / 1000000).toFixed(0);
                const max = salary.max ? (salary.max / 1000000).toFixed(0) : null;
                return max ? `${min} - ${max} triệu VNĐ` : `Từ ${min} triệu VNĐ`;
              })}
              gridCols={getGridCols()}
            />

            {/* Location */}
            <ComparisonRow
              label="Địa chỉ"
              icon={<MapPin className="h-4 w-4" />}
              values={candidates.map(c => c.candidateProfileId?.address || 'Chưa cập nhật')}
              gridCols={getGridCols()}
            />

            {/* Experience */}
            <ComparisonRow
              label="Kinh nghiệm làm việc"
              icon={<Briefcase className="h-4 w-4" />}
              values={candidates.map(c => {
                const profile = c.candidateProfileId;
                if (!profile?.experiences?.length) return 'Chưa có kinh nghiệm';
                return (
                  <div className="text-sm space-y-3">
                    {profile.experiences.map((exp, idx) => {
                      const startDate = exp.startDate ? new Date(exp.startDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : 'N/A';
                      const endDate = exp.endDate ? new Date(exp.endDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' }) : 'Hiện tại';

                      return (
                        <div key={idx} className="pb-3 border-b last:border-0 last:pb-0">
                          <div className="font-medium text-blue-700">{exp.position || 'N/A'}</div>
                          <div className="text-gray-700 font-medium">{exp.company || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {startDate} - {endDate}
                          </div>
                          {exp.description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {exp.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              gridCols={getGridCols()}
            />

            {/* Education */}
            <ComparisonRow
              label="Học vấn"
              icon={<GraduationCap className="h-4 w-4" />}
              values={candidates.map(c => {
                const profile = c.candidateProfileId;
                if (!profile?.educations?.length) return 'Chưa cập nhật';
                return (
                  <div className="text-sm space-y-3">
                    {profile.educations.map((edu, idx) => (
                      <div key={idx} className="pb-3 border-b last:border-0 last:pb-0">
                        <div className="font-medium text-green-700">{edu.degree || 'N/A'}</div>
                        <div className="text-gray-700">{edu.institution || 'N/A'}</div>
                        {edu.graduationYear && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Tốt nghiệp: {edu.graduationYear}
                          </div>
                        )}
                        {edu.major && (
                          <div className="text-xs text-muted-foreground">
                            Chuyên ngành: {edu.major}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
              gridCols={getGridCols()}
            />

            {/* Skills */}
            <ComparisonRow
              label="Kỹ năng"
              icon={<Star className="h-4 w-4" />}
              values={candidates.map(c => {
                const profile = c.candidateProfileId;
                if (!profile?.skills?.length) return 'Chưa có';
                return (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {typeof skill === 'string' ? skill : skill.name}
                      </Badge>
                    ))}
                  </div>
                );
              })}
              gridCols={getGridCols()}
            />

            {/* Certificates */}
            <ComparisonRow
              label="Chứng chỉ"
              icon={<Star className="h-4 w-4" />}
              values={candidates.map(c => {
                const profile = c.candidateProfileId;
                if (!profile?.certificates?.length) return 'Chưa có';
                return (
                  <div className="text-sm space-y-2">
                    {profile.certificates.map((cert, idx) => (
                      <div key={idx} className="pb-2 border-b last:border-0 last:pb-0">
                        <div className="font-medium text-purple-700">{cert.name || 'N/A'}</div>
                        {cert.issuingOrganization && (
                          <div className="text-xs text-muted-foreground">{cert.issuingOrganization}</div>
                        )}
                        {cert.issueDate && (
                          <div className="text-xs text-muted-foreground">
                            Cấp: {new Date(cert.issueDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
              gridCols={getGridCols()}
            />

            {/* Projects */}
            <ComparisonRow
              label="Dự án"
              icon={<Briefcase className="h-4 w-4" />}
              values={candidates.map(c => {
                const profile = c.candidateProfileId;
                if (!profile?.projects?.length) return 'Chưa có';
                return (
                  <div className="text-sm space-y-2">
                    {profile.projects.map((project, idx) => (
                      <div key={idx} className="pb-2 border-b last:border-0 last:pb-0">
                        <div className="font-medium text-indigo-700">{project.name || 'N/A'}</div>
                        {project.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {project.description}
                          </div>
                        )}
                        {project.role && (
                          <div className="text-xs text-muted-foreground">Vai trò: {project.role}</div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
              gridCols={getGridCols()}
            />

            {/* Bio/Summary */}
            <ComparisonRow
              label="Giới thiệu bản thân"
              icon={<FileText className="h-4 w-4" />}
              values={candidates.map(c => {
                const bio = c.candidateProfileId?.bio;
                if (!bio) return 'Chưa có';
                return (
                  <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                    {bio}
                  </div>
                );
              })}
              gridCols={getGridCols()}
            />

            {/* Recruiter Notes */}
            <ComparisonRow
              label="Ghi chú của bạn"
              icon={<FileText className="h-4 w-4" />}
              values={candidates.map(c => {
                if (!c.recruiterNotes) return <span className="text-muted-foreground text-xs">Chưa có ghi chú</span>;
                return (
                  <div className="text-sm max-h-24 overflow-y-auto">
                    {c.recruiterNotes}
                  </div>
                );
              })}
              gridCols={getGridCols()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Differences Highlight */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Điểm khác biệt chính</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status Comparison */}
            <div>
              <h4 className="font-medium text-sm mb-2">Trạng thái</h4>
              <div className={`grid ${getGridCols()} gap-2`}>
                {candidates.map((c, idx) => (
                  <div key={idx} className="text-center p-2 bg-gray-50 rounded">
                    {getStatusBadge(c.status)}
                  </div>
                ))}
              </div>
            </div>



            {/* Years of Experience */}
            <div>
              <h4 className="font-medium text-sm mb-2">Số năm kinh nghiệm</h4>
              <div className={`grid ${getGridCols()} gap-2`}>
                {candidates.map((c, idx) => {
                  const profile = c.candidateProfileId;
                  const totalYears = profile?.experiences?.reduce((sum, exp) => {
                    if (!exp.startDate) return sum;
                    const start = new Date(exp.startDate);
                    const end = exp.endDate ? new Date(exp.endDate) : new Date();
                    const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
                    return sum + years;
                  }, 0) || 0;

                  return (
                    <div key={idx} className="text-center p-2 bg-gray-50 rounded font-medium">
                      {totalYears > 0 ? `${totalYears.toFixed(1)} năm` : 'Chưa có'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Reusable Comparison Row Component
const ComparisonRow = ({ label, icon, values, gridCols }) => {
  return (
    <div className="border-b pb-4">
      <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
        {icon}
        {label}
      </h4>
      <div className={`grid ${gridCols} gap-4`}>
        {values.map((value, idx) => (
          <div key={idx} className="p-3 bg-gray-50 rounded min-h-[60px] flex items-center justify-center">
            {typeof value === 'string' ? (
              <span className="text-sm text-center">{value}</span>
            ) : (
              value
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateComparison;
