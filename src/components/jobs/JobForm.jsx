import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import * as jobService from '@/services/jobService';
import {
  jobTypeEnum,
  workTypeEnum,
  experienceEnum,
  jobCategoryEnum,
  LOCATIONS,
} from '@/constants';
import { createJobSchema } from '@/utils/validation';

const JobForm = ({ onSuccess, job }) => {
  const isEditMode = !!job;
  const form = useForm({
    resolver: zodResolver(createJobSchema),
    defaultValues: isEditMode
      ? {
          ...job,
          deadline: job.deadline ? new Date(job.deadline) : undefined,
          location: {
            city: job.location?.city || '',
            district: job.location?.district || '',
            address: job.location?.address || '',
          },
        }
      : {
          title: '',
          description: '',
          requirements: '',
          benefits: '',
          location: {
            city: '',
            district: '',
            address: '',
          },
          type: 'FULL_TIME',
          workType: 'ON_SITE',
          minSalary: undefined,
          maxSalary: undefined,
          deadline: undefined,
          experience: 'ENTRY_LEVEL',
          category: 'IT',
        },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = useCallback(
    async (values) => {
      setIsSubmitting(true);
      try {
        let response;
        if (isEditMode) {
          response = await jobService.updateJob(job._id, values);
        } else {
          response = await jobService.createJob(values);
        }
        toast.success(response.message || `Job ${isEditMode ? 'updated' : 'created'} successfully!`);
        onSuccess && onSuccess(response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} job.`;
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, job, onSuccess],
  );

  const districtsForSelectedCity = LOCATIONS.DISTRICTS; // Assuming all districts are available for now, or filter based on city if needed.

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề công việc</FormLabel>
              <FormControl>
                <Input placeholder="Chuyên viên Phát triển Web Fullstack" {...field} />
              </FormControl>
              <FormDescription>Tiêu đề hấp dẫn sẽ thu hút nhiều ứng viên.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả công việc</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tham gia phát triển các ứng dụng web phức tạp..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Mô tả chi tiết về công việc và trách nhiệm.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Yêu cầu công việc</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Có kinh nghiệm 3+ năm với JavaScript, React..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Các kỹ năng và kinh nghiệm cần thiết cho vị trí.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quyền lợi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Lương cạnh tranh, bảo hiểm đầy đủ..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Các phúc lợi mà ứng viên sẽ nhận được.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="location.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thành phố</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thành phố" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOCATIONS.CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location.district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quận/Huyện</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quận/huyện" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {districtsForSelectedCity.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ chi tiết</FormLabel>
                <FormControl>
                  <Input placeholder="123 Đường ABC, Phường XYZ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại công việc</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại công việc" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobTypeEnum.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="workType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hình thức làm việc</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hình thức làm việc" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {workTypeEnum.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lương tối thiểu (VND)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10,000,000" {...field} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lương tối đa (VND)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="50,000,000" {...field} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Hạn chót nộp hồ sơ</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Chọn ngày</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DayPicker
                    showOutsideDays
                    fixedWeeks
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    animate
                    footer={
                      field.value
                        ? `Ngày đã chọn: ${format(field.value, 'PPP')}`
                        : 'Vui lòng chọn một ngày.'
                    }
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Ngày cuối cùng ứng viên có thể nộp hồ sơ.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cấp bậc kinh nghiệm</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cấp bậc kinh nghiệm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceEnum.map((exp) => (
                      <SelectItem key={exp} value={exp}>
                        {exp.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngành nghề</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngành nghề" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobCategoryEnum.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang xử lý...' : isEditMode ? 'Cập nhật công việc' : 'Đăng tải công việc'}
        </Button>
      </form>
    </Form>
  );
};

export default JobForm;
