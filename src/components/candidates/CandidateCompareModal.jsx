import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import * as applicationService from '@/services/applicationService';
import * as utils from '@/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ErrorState from '@/components/common/ErrorState';
import Modal from '@/components/common/Modal';
import {
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

const CandidateCompareModal = ({ isOpen, onClose, applicationIds = [], onRemoveCandidate, onViewDetail }) => {
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCandidates = useCallback(async () => {
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
    }, [applicationIds]);

    useEffect(() => {
        if (isOpen && applicationIds.length > 0) {
            fetchCandidates();
        }
    }, [isOpen, applicationIds, fetchCandidates]);

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



    const getGridCols = () => {
        switch (candidates.length) {
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            case 4: return 'grid-cols-4';
            case 5: return 'grid-cols-5';
            default: return 'grid-cols-2';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`So sánh ứng viên (${candidates.length})`}
            description="So sánh chi tiết các ứng viên đã chọn"
            size="full"
        >
            {isLoading ? (
                <div className="space-y-6">
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
            ) : error ? (
                <ErrorState message={error} onRetry={fetchCandidates} />
            ) : (
                <>
                    {/* Candidate Cards - Grid Layout */}
                    <div className={`grid ${getGridCols()} gap-4 mb-6`}>
                        {candidates.map((candidate) => (
                            <Card key={candidate._id} className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                                    onClick={() => onRemoveCandidate(candidate._id)}
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
                                        onClick={() => onViewDetail(candidate._id)}
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
                            {/* Job Information */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Vị trí ứng tuyển
                                </h3>
                                <p className="font-medium">{candidates[0]?.jobId?.title || 'N/A'}</p>
                            </div>

                            {/* Comparison Table */}
                            <div className="space-y-4">
                                <ComparisonRow
                                    label="Ngày ứng tuyển"
                                    icon={<Calendar className="h-4 w-4" />}
                                    values={candidates.map(c => utils.formatDateTime(c.appliedAt))}
                                    gridCols={getGridCols()}
                                />

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

                                <ComparisonRow
                                    label="Địa chỉ"
                                    icon={<MapPin className="h-4 w-4" />}
                                    values={candidates.map(c => c.candidateProfileId?.address || 'Chưa cập nhật')}
                                    gridCols={getGridCols()}
                                />

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
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })}
                                    gridCols={getGridCols()}
                                />

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
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                    gridCols={getGridCols()}
                                />

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
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </Modal>
    );
};

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

export default CandidateCompareModal;
