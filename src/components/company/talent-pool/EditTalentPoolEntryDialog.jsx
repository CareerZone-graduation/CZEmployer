import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as talentPoolService from '@/services/talentPoolService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  notes: z.string().optional(),
});

const EditTalentPoolEntryDialog = ({ entry, open, onClose }) => {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: entry.notes || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ talentPoolId, data }) =>
      talentPoolService.updateTalentPoolEntry(talentPoolId, undefined, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['talentPool']);
      toast.success('Cập nhật thành công');
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật');
    },
  });

  const onSubmit = (data) => {
    updateMutation.mutate({
      talentPoolId: entry._id,
      data,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Ghi chú</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho ứng viên {entry.candidateSnapshot?.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Thêm ghi chú về ứng viên..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTalentPoolEntryDialog;


