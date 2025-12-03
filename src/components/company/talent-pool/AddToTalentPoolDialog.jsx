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

const AddToTalentPoolDialog = ({ applicationId, candidateName, open, onClose, onSuccess }) => {
    const queryClient = useQueryClient();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            notes: '',
        },
    });

    const addMutation = useMutation({
        mutationFn: (data) =>
            talentPoolService.addToTalentPool(applicationId, [], data.notes),
        onSuccess: () => {
            queryClient.invalidateQueries(['talentPool']);
            toast.success('Đã thêm ứng viên vào Talent Pool');
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Lỗi khi thêm vào Talent Pool');
        },
    });

    const onSubmit = (data) => {
        addMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Thêm vào Talent Pool</DialogTitle>
                    <DialogDescription>
                        Thêm ghi chú cho ứng viên {candidateName}
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
                            <Button type="submit" disabled={addMutation.isLoading}>
                                {addMutation.isLoading ? 'Đang thêm...' : 'Thêm vào Pool'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AddToTalentPoolDialog;
