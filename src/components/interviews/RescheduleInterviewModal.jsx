import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate } from '@/utils/formatDate';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const RescheduleInterviewModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hour, setHour] = useState(new Date().getHours());
  const [minute, setMinute] = useState(new Date().getMinutes());
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setSelectedDate(now);
      setHour(now.getHours());
      setMinute(now.getMinutes());
      setReason('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!selectedDate) {
      toast.error('Vui lòng chọn ngày phỏng vấn.');
      return;
    }

    const newScheduledTime = new Date(selectedDate);
    newScheduledTime.setHours(hour, minute, 0, 0);

    if (newScheduledTime <= new Date()) {
      toast.error('Thời gian dời lịch phải ở trong tương lai.');
      return;
    }

    onSubmit({
      scheduledTime: newScheduledTime.toISOString(),
      reason: reason,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dời lịch phỏng vấn</DialogTitle>
          <DialogDescription>
            Chọn ngày và giờ mới cho cuộc phỏng vấn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledTime">Ngày phỏng vấn</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? formatDate(selectedDate, "PPP") : <span>Chọn ngày</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Giờ phỏng vấn</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value, 10))}
                className="w-full"
                placeholder="Giờ"
              />
              <span>:</span>
              <Input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(parseInt(e.target.value, 10))}
                className="w-full"
                placeholder="Phút"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do dời lịch</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Bận việc đột xuất"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleInterviewModal;