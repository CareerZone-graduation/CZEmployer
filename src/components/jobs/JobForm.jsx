import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

import * as jobService from '@/services/jobService';
import {
  jobTypeEnum,
  jobTypeMap,
  workTypeEnum,
  workTypeMap,
  experienceEnum,
  experienceMap,
  jobCategoryEnum,
  jobCategoryMap,
} from '@/constants';
import { createJobSchema, updateJobSchema } from '@/utils/validation';
import LocationPicker from '@/components/common/LocationPicker';

const JobForm = ({ onSuccess, job }) => {
  const isEditMode = !!job;
  
  const form = useForm({
    resolver: zodResolver(isEditMode ? updateJobSchema : createJobSchema),
    defaultValues: isEditMode
      ? {
          ...job,
          deadline: job.deadline ? new Date(job.deadline) : undefined,
          location: {
            province: job.location?.province || '',
            district: job.location?.district || '',
            commune: job.location?.commune || '',
          },
          address: job.address || job.location?.address || '',
        }
      : {
          title: '',
          description: '',
          requirements: '',
          benefits: '',
          location: {
            province: '',
            district: '',
            commune: '',
          },
          address: '',
          type: 'FULL_TIME',
          workType: 'ON_SITE',
          minSalary: undefined,
          maxSalary: undefined,
          deadline: undefined,
          experience: 'ENTRY_LEVEL',
          category: 'IT',
        },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = useCallback(
    async (values) => {
      try {
        let response;
        if (isEditMode) {
          // Ensure we only send changed values for updates
          const changedValues = Object.fromEntries(
            Object.entries(values).filter(([key, value]) => {
              if (key === 'location') {
                return value.province !== job.location?.province || value.district !== job.location?.district || value.commune !== job.location?.commune;
              }
              return job[key] !== value;
            })
          );
          response = await jobService.updateJob(job._id, changedValues);
        } else {
          response = await jobService.createJob(values);
        }
        toast.success(isEditMode ? 'Cập nhật thành công!' : 'Tạo tin tuyển dụng thành công!', {
          description: response.message || `Tin tuyển dụng đã được ${isEditMode ? 'cập nhật' : 'tạo'} thành công.`
        });
        onSuccess && onSuccess(response.data);
      } catch (error) {
        const errorMessage = error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} job.`;
        toast.error(isEditMode ? 'Cập nhật thất bại' : 'Tạo tin tuyển dụng thất bại', {
          description: errorMessage
        });
      }
    },
    [isEditMode, job, onSuccess],
  );

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocationPicker
            control={form.control}
            provinceFieldName="location.province"
            districtFieldName="location.district"
            communeFieldName="location.commune"
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ chi tiết *</FormLabel>
              <FormControl>
                <Input placeholder="123 Đường ABC, Tòa nhà XYZ, Khu vực DEF" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại công việc</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full truncate">
                      <SelectValue placeholder="Chọn loại công việc" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobTypeEnum.map((type) => (
                      <SelectItem key={type} value={type}>
                        {jobTypeMap[type]}
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
                    <SelectTrigger className="w-full truncate">
                      <SelectValue placeholder="Chọn hình thức làm việc" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {workTypeEnum.map((type) => (
                      <SelectItem key={type} value={type}>
                        {workTypeMap[type]}
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
                  <Input 
                    type="number" 
                    placeholder="10,000,000" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} 
                  />
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
                  <Input 
                    type="number" 
                    placeholder="50,000,000" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} 
                  />
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
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "dd/MM/yyyy") : "Chọn ngày"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    captionLayout="dropdown"
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        const newDate = new Date(date);
                        newDate.setHours(23, 59, 59, 999);
                        field.onChange(newDate);
                      } else {
                        field.onChange(undefined);
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Ngày cuối cùng ứng viên có thể nộp hồ sơ (deadline sẽ là 23:59 của ngày được chọn).
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
                    <SelectTrigger className="w-full truncate">
                      <SelectValue placeholder="Chọn cấp bậc kinh nghiệm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {experienceEnum.map((exp) => (
                      <SelectItem key={exp} value={exp}>
                        {experienceMap[exp]}
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
                    <SelectTrigger className="w-full truncate">
                      <SelectValue placeholder="Chọn ngành nghề" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jobCategoryEnum.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {jobCategoryMap[cat]}
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

