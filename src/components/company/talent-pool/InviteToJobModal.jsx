import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  Search,
  Briefcase,
  MapPin,
  Calendar,
  UserPlus,
  Info
} from 'lucide-react';
import * as jobService from '@/services/jobService';
import * as talentPoolService from '@/services/talentPoolService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Modal from '@/components/common/Modal';
import * as utils from '@/utils';

const InviteToJobModal = ({ isOpen, onClose, candidateProfileId, candidateName, invitations = [], appliedJobId = null }) => {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch active jobs
  const { data: jobsResponse, isLoading } = useQuery({
    queryKey: ['myJobs', { status: 'ACTIVE', limit: 50 }],
    queryFn: () => jobService.getMyJobs({ status: 'ACTIVE', limit: 50 }),
    enabled: isOpen,
  });

  const jobs = jobsResponse?.data || [];

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => {
    const title = job.title?.toLowerCase() || '';
    const company = job.company?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return title.includes(search) || company.includes(search);
  });

  // Mutation to invite candidate
  const inviteMutation = useMutation({
    mutationFn: (data) => talentPoolService.inviteCandidates(data),
    onSuccess: () => {
      toast.success(`Đã gửi lời mời ứng tuyển cho ứng viên ${candidateName}`);
      queryClient.invalidateQueries(['talentPool']);
      onClose();
      setSelectedJobId('');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi gửi lời mời');
    },
  });

  const handleInvite = () => {
    if (!selectedJobId) {
      toast.error('Vui lòng chọn một công việc để mời');
      return;
    }

    inviteMutation.mutate({
      jobId: selectedJobId,
      candidateProfileIds: [candidateProfileId]
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mời ứng tuyển"
      description={`Chọn một vị trí đang tuyển dụng để mời ${candidateName} ứng tuyển.`}
      size="large"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm vị trí tuyển dụng..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Job List */}
        <div className="border rounded-lg overflow-hidden">
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải danh sách công việc...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              <RadioGroup
                value={selectedJobId}
                onValueChange={setSelectedJobId}
                className="gap-0"
              >
                {filteredJobs.map((job) => {
                  const isInvited = invitations.some(inv => inv.jobId === job._id || inv.jobId?._id === job._id);
                  const isApplied = appliedJobId === job._id || appliedJobId?._id === job._id;
                  const isDisabled = isInvited || isApplied;

                  return (
                    <div
                      key={job._id}
                      className={`flex items-start gap-4 p-4 transition-colors border-b last:border-0 ${
                        isDisabled ? 'bg-muted/30 opacity-70 cursor-not-allowed' : 'hover:bg-muted/50'
                      } ${
                        selectedJobId === job._id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="pt-1">
                        <RadioGroupItem value={job._id} id={job._id} disabled={isDisabled} />
                      </div>
                      <Label htmlFor={job._id} className={`flex-1 font-normal ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-900 line-clamp-1">
                              {job.title}
                            </h4>
                            <div className="flex gap-2">
                              {isApplied && (
                                <Badge variant="secondary" className="shrink-0 bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  Đã ứng tuyển
                                </Badge>
                              )}
                              {isInvited && !isApplied && (
                                <Badge variant="secondary" className="shrink-0 bg-amber-100 text-amber-800 hover:bg-amber-100">
                                  Đã mời
                                </Badge>
                              )}
                              <Badge variant="outline" className="shrink-0 capitalize">
                                {job.jobType?.replace('_', ' ').toLowerCase()}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{job.location?.city || 'Toàn quốc'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3.5 w-3.5" />
                              <span>{job.experienceLevel}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Ngày đăng: {utils.formatDate(job.createdAt)}</span>
                            </div>
                          </div>

                          {job.salary && (
                            <div className="mt-2 text-sm font-medium text-primary">
                              {job.salary.isNegotiable
                                ? 'Lương thỏa thuận'
                                : `${utils.formatCurrency(job.salary.min)} - ${utils.formatCurrency(job.salary.max)} ${job.salary.currency}`}
                            </div>
                          )}
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">Không tìm thấy tin tuyển dụng</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  {searchTerm
                    ? `Không tìm thấy tin nào khớp với từ khóa "${searchTerm}"`
                    : 'Bạn hiện không có tin tuyển dụng nào đang hoạt động.'}
                </p>
                {!searchTerm && (
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => window.open('/jobs/create', '_blank')}
                  >
                    Tạo tin tuyển dụng mới
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Info box if no jobs selected */}
        {!selectedJobId && filteredJobs.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3 flex items-start gap-2 text-blue-700 text-sm">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Vui lòng chọn một công việc trong danh sách trên để gửi lời mời cho ứng viên.</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose} disabled={inviteMutation.isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!selectedJobId || inviteMutation.isPending}
            className="min-w-[140px]"
          >
            {inviteMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Gửi lời mời
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InviteToJobModal;
