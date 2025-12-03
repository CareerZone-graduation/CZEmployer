import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as talentPoolService from '@/services/talentPoolService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Trash2, Edit, Eye, Briefcase } from 'lucide-react';
import * as utils from '@/utils';
import EditTalentPoolEntryDialog from './EditTalentPoolEntryDialog';
import { useNavigate } from 'react-router-dom';

const TalentPoolTable = ({ data, meta, onPageChange }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [entryToEdit, setEntryToEdit] = useState(null);

  // Remove mutation
  const removeMutation = useMutation({
    mutationFn: talentPoolService.removeFromTalentPool,
    onSuccess: () => {
      queryClient.invalidateQueries(['talentPool']);
      toast.success('Đã xóa ứng viên khỏi talent pool');
      setEntryToDelete(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi xóa ứng viên');
    },
  });

  const handleRemove = (talentPoolId) => {
    setEntryToDelete(talentPoolId);
  };

  const confirmRemove = () => {
    if (entryToDelete) {
      removeMutation.mutate(entryToDelete);
    }
  };

  const handleEdit = (entry) => {
    setEntryToEdit(entry);
  };

  const handleViewApplication = (entry) => {
    // Navigate to application detail page
    const applicationId = entry.applicationId?._id || entry.applicationId;
    const jobId = entry.candidateSnapshot?.appliedJobId;

    if (applicationId && jobId) {
      navigate(`/jobs/${jobId}/applications/${applicationId}`);
    } else {
      toast.error('Không tìm thấy thông tin đơn ứng tuyển');
    }
  };

  const handleViewJob = (jobId) => {
    const id = jobId?._id || jobId;
    if (id) {
      navigate(`/jobs/recruiter/${id}`);
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ứng viên</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Công việc đã ứng tuyển</TableHead>
              <TableHead>Ngày thêm</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.candidateSnapshot?.avatar} />
                      <AvatarFallback>
                        {entry.candidateSnapshot?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{entry.candidateSnapshot?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {entry.candidateSnapshot?.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground max-w-xs">
                    {truncateText(entry.notes)}
                  </div>
                </TableCell>
                <TableCell>
                  {entry.candidateSnapshot?.appliedJobTitle ? (
                    <button
                      onClick={() => handleViewJob(entry.candidateSnapshot.appliedJobId)}
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                      {truncateText(entry.candidateSnapshot.appliedJobTitle, 30)}
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {utils.formatDate(entry.addedAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewApplication(entry)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem đơn ứng tuyển
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(entry)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa Ghi chú
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRemove(entry._id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa khỏi pool
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {((meta.currentPage - 1) * meta.limit) + 1} đến{' '}
            {Math.min(meta.currentPage * meta.limit, meta.total)} trong tổng số {meta.total} ứng viên
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(meta.currentPage - 1)}
              disabled={meta.currentPage === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(meta.currentPage + 1)}
              disabled={meta.currentPage === meta.totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!entryToDelete} onOpenChange={() => setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ứng viên này khỏi talent pool? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {entryToEdit && (
        <EditTalentPoolEntryDialog
          entry={entryToEdit}
          open={!!entryToEdit}
          onClose={() => setEntryToEdit(null)}
        />
      )}
    </>
  );
};

export default TalentPoolTable;
