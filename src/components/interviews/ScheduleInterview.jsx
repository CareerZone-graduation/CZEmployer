import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import * as interviewService from '@/services/interviewService';

// Validation schema
const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Vui lòng chọn ứng viên'),
  scheduledDate: z.date({
    required_error: 'Vui lòng chọn ngày phỏng vấn',
  }),
  scheduledTime: z.string().min(1, 'Vui lòng chọn giờ phỏng vấn'),
  duration: z.string().min(1, 'Vui lòng chọn thời lượng'),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
});

const DURATION_OPTIONS = [
  { value: '30', label: '30 phút' },
  { value: '45', label: '45 phút' },
  { value: '60', label: '1 giờ' },
  { value: '90', label: '1.5 giờ' },
  { value: '120', label: '2 giờ' },
];

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const ScheduleInterview = ({
  open,
  onOpenChange,
  application,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState(null);

  const form = useForm({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: {
      applicationId: application?._id || '',
      scheduledDate: undefined,
      scheduledTime: '',
      duration: '60',
      timezone: 'Asia/Ho_Chi_Minh',
    },
  });

  useEffect(() => {
    if (application) {
      form.reset({
        applicationId: application._id,
        scheduledDate: undefined,
        scheduledTime: '',
        duration: '60',
        timezone: 'Asia/Ho_Chi_Minh',
      });
    }
  }, [application, form]);

  const onSubmit = (data) => {
    setFormData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    setIsSubmitting(true);
    try {
      // Combine date and time
      const [hours, minutes] = formData.scheduledTime.split(':');
      const scheduledDateTime = new Date(formData.scheduledDate);
      scheduledDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      // Call API
      await interviewService.scheduleInterview({
        applicationId: formData.applicationId,
        scheduledAt: scheduledDateTime.toISOString(),
        duration: parseInt(formData.duration, 10),
        jobId: application?.jobId?._id || application?.jobId,
        candidateId: application?.candidateUserId,
      });

      toast.success('Lên lịch phỏng vấn thành công!');
      form.reset();
      setShowConfirmation(false);
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi khi lên lịch phỏng vấn.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setFormData(null);
  };

  const getConfirmationDetails = () => {
    if (!formData) return null;

    const dateTime = new Date(formData.scheduledDate);
    const [hours, minutes] = formData.scheduledTime.split(':');
    dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    return {
      candidate: application?.candidateName || 'N/A',
      job: application?.jobSnapshot?.title || 'N/A',
      dateTime: format(dateTime, "EEEE, dd MMMM yyyy 'lúc' HH:mm", { locale: vi }),
      duration: DURATION_OPTIONS.find(d => d.value === formData.duration)?.label || formData.duration,
      timezone: 'Giờ Việt Nam (GMT+7)',
    };
  };

  if (showConfirmation) {
    const details = getConfirmationDetails();

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Xác nhận lịch phỏng vấn</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại thông tin trước khi xác nhận
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 text-sm font-medium text-muted-foreground">
                Ứng viên:
              </div>
              <div className="col-span-2 text-sm font-semibold">
                {details.candidate}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 text-sm font-medium text-muted-foreground">
                Vị trí:
              </div>
              <div className="col-span-2 text-sm">
                {details.job}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 text-sm font-medium text-muted-foreground">
                Thời gian:
              </div>
              <div className="col-span-2 text-sm">
                {details.dateTime}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 text-sm font-medium text-muted-foreground">
                Thời lượng:
              </div>
              <div className="col-span-2 text-sm">
                {details.duration}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 text-sm font-medium text-muted-foreground">
                Múi giờ:
              </div>
              <div className="col-span-2 text-sm">
                {details.timezone}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Lên lịch phỏng vấn</DialogTitle>
          <DialogDescription>
            Thiết lập thời gian phỏng vấn cho ứng viên {application?.candidateName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Candidate Info */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ứng viên:</span>
                  <span className="text-sm">{application?.candidateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Vị trí:</span>
                  <span className="text-sm">{application?.jobSnapshot?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{application?.candidateEmail}</span>
                </div>
              </div>
            </div>

            {/* Date Picker */}
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày phỏng vấn</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP', { locale: vi })
                          ) : (
                            <span>Chọn ngày</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Chọn ngày bạn muốn phỏng vấn ứng viên
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Picker */}
            <FormField
              control={form.control}
              name="scheduledTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giờ phỏng vấn</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giờ">
                          {field.value && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {field.value}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chọn giờ bắt đầu phỏng vấn (Giờ Việt Nam)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời lượng</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thời lượng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Thời gian dự kiến cho buổi phỏng vấn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                Tiếp tục
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterview;
