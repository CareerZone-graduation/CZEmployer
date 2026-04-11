import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  X,
  Search,
  UserPlus,
  Mail,
  Briefcase,
  CheckCircle2,
  Users,
  Loader2
} from 'lucide-react';
import * as talentPoolService from '@/services/talentPoolService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/common/Modal';

const InviteTalentPoolModal = ({ isOpen, onClose, jobId, jobTitle }) => {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy danh sách talent pool
  const { data: talentData, isLoading } = useQuery({
    queryKey: ['talentPool', { limit: 100 }],
    queryFn: () => talentPoolService.getTalentPool({ limit: 100 }),
    enabled: isOpen,
  });

  const candidates = talentData?.data || [];

  // Filter candidates based on search term
  const filteredCandidates = candidates.filter(candidate => {
    const name = candidate.candidateSnapshot?.name?.toLowerCase() || '';
    const email = candidate.candidateSnapshot?.email?.toLowerCase() || '';
    const title = candidate.candidateSnapshot?.title?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search) || title.includes(search);
  });

  // Mutation mời ứng viên
  const inviteMutation = useMutation({
    mutationFn: (data) => talentPoolService.inviteCandidates(data),
    onSuccess: () => {
      toast.success(`Đã gửi lời mời cho ${selectedIds.length} ứng viên ứng tuyển vào vị trí ${jobTitle}`);
      queryClient.invalidateQueries(['talentPool']);
      onClose();
      setSelectedIds([]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi gửi lời mời');
    },
  });

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      // Use candidateProfileId instead of TalentPool entry _id
      setSelectedIds(filteredCandidates.map(c => c.candidateProfileId));
    }
  };

  const handleSelectCandidate = (candidateProfileId) => {
    setSelectedIds(prev =>
      prev.includes(candidateProfileId)
        ? prev.filter(item => item !== candidateProfileId)
        : [...prev, candidateProfileId]
    );
  };

  const handleInvite = () => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ứng viên');
      return;
    }

    inviteMutation.mutate({
      jobId,
      candidateProfileIds: selectedIds // Fix parameter name to match backend schema
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mời ứng viên từ Talent Pool"
      description={`Mời các ứng viên tiềm năng ứng tuyển vào vị trí ${jobTitle}`}
      size="large"
    >
      <div className="space-y-4">
        {/* Search and Selection info */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm ứng viên..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Đã chọn <span className="font-semibold text-primary">{selectedIds.length}</span> ứng viên
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredCandidates.length === 0}
            >
              {selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0
                ? 'Bỏ chọn tất cả'
                : 'Chọn tất cả'}
            </Button>
          </div>
        </div>

        {/* Candidate List */}
        <div className="border rounded-lg overflow-hidden">
          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải danh sách ứng viên...</p>
              </div>
            ) : filteredCandidates.length > 0 ? (
              <div className="divide-y">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 ${
                      selectedIds.includes(candidate.candidateProfileId) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedIds.includes(candidate.candidateProfileId)}
                        onCheckedChange={() => handleSelectCandidate(candidate.candidateProfileId)}
                      />
                    </div>

                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={candidate.candidateSnapshot?.avatar} alt={candidate.candidateSnapshot?.name} />
                      <AvatarFallback>{candidate.candidateSnapshot?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 truncate">
                            {candidate.candidateSnapshot?.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{candidate.candidateSnapshot?.email}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="hidden sm:inline-flex">
                          {candidate.candidateSnapshot?.title || 'Ứng viên'}
                        </Badge>
                      </div>

                      {candidate.candidateSnapshot?.skills && candidate.candidateSnapshot.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {candidate.candidateSnapshot.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-[10px] font-normal py-0 px-1.5">
                              {typeof skill === 'string' ? skill : skill.name}
                            </Badge>
                          ))}
                          {candidate.candidateSnapshot.skills.length > 5 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{candidate.candidateSnapshot.skills.length - 5}
                            </span>
                          )}
                        </div>
                      )}

                      {candidate.notes && (
                        <p className="mt-2 text-xs text-muted-foreground italic line-clamp-1">
                          Ghi chú: {candidate.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg">Không tìm thấy ứng viên</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  {searchTerm
                    ? `Không tìm thấy ứng viên nào khớp với từ khóa "${searchTerm}"`
                    : 'Talent Pool của bạn hiện đang trống.'}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className={`h-4 w-4 ${selectedIds.length > 0 ? 'text-green-500' : 'text-gray-300'}`} />
            {selectedIds.length > 0
              ? `Đã chọn ${selectedIds.length} ứng viên để mời`
              : 'Chọn ứng viên để bắt đầu mời'}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} disabled={inviteMutation.isPending}>
              Bỏ qua
            </Button>
            <Button
              onClick={handleInvite}
              disabled={selectedIds.length === 0 || inviteMutation.isPending}
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
                  Mời ứng tuyển
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InviteTalentPoolModal;
