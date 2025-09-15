import React, { useCallback, useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, MapPin } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import * as jobService from '@/services/jobService';
import * as companyService from '@/services/companyService';
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
import GoongLocationPicker from '@/components/common/GoongLocationPicker';
import LocationPicker from '@/components/common/LocationPicker';
import {
    mapGoongLocationToStandard,
    getProvinces,
    getDistrictsForProvince,
    getCommunesForDistrict
} from '@/utils/locationUtils';


const JobForm = ({ onSuccess, job }) => {
  const isEditMode = !!job;
  const [showMap, setShowMap] = useState(false);
  
  // State for location dropdowns
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [isLocationLoading, setIsLocationLoading] = useState(true);


  const form = useForm({
    resolver: zodResolver(isEditMode ? updateJobSchema : createJobSchema),
    defaultValues: isEditMode
      ? {
          ...job,
          deadline: job.deadline ? new Date(job.deadline) : undefined,
          useCompanyAddress: job.useCompanyAddress || false,
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
          useCompanyAddress: false,
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

  const { isSubmitting, control, setValue, trigger } = form;
  const useCompanyAddress = useWatch({ control, name: 'useCompanyAddress' });
  const watchedProvince = useWatch({ control, name: 'location.province' });
  const watchedDistrict = useWatch({ control, name: 'location.district' });

  // --- Location Logic ---

  // Load all provinces on mount
  useEffect(() => {
    setProvinces(getProvinces());
    setIsLocationLoading(false);
  }, []);

  // Update districts when province changes
  useEffect(() => {
    if (watchedProvince) {
      const newDistricts = getDistrictsForProvince(watchedProvince);
      console.log("Province changed:", watchedProvince, "=> New Districts:", newDistricts);
      setDistricts(newDistricts);
    } else {
      setDistricts([]);
    }
  }, [watchedProvince]);

  // Update communes when district changes
  useEffect(() => {
    if (watchedProvince && watchedDistrict) {
      const newCommunes = getCommunesForDistrict(watchedProvince, watchedDistrict);
      console.log("District changed:", watchedDistrict, "=> New Communes:", newCommunes);
      setCommunes(newCommunes);
    } else {
      setCommunes([]);
    }
  }, [watchedProvince, watchedDistrict]);


  const handleFetchCompanyAddress = useCallback(async () => {
    try {
      const response = await companyService.getMyCompanyAddress();
      if (response.success) {
        const { location, address } = response.data;
        const mapped = mapGoongLocationToStandard(location);
        
        setValue('location.province', mapped.province);
        setValue('location.district', mapped.district);
        setValue('location.commune', mapped.commune);
        setValue('address', address);
        
        // Trigger validation for all fields at once after setting them
        trigger(['location.province', 'location.district', 'location.commune', 'address']);

        toast.success('Đã lấy địa chỉ công ty thành công!');
      } else {
        toast.error('Không thể lấy địa chỉ công ty.', {
          description: response.message,
        });
      }
    } catch (error) {
      toast.error('Lỗi khi lấy địa chỉ công ty.', {
        description: error.response?.data?.message || 'Vui lòng thử lại.',
      });
    }
  }, [setValue]);
  
  const onSubmit = useCallback(
    async (values) => {
      try {
        let response;
        const payload = { ...values };

        if (payload.useCompanyAddress) {
          delete payload.location;
          delete payload.address;
        }


        if (isEditMode) {
          response = await jobService.updateJob(job._id, payload);
        } else {
          response = await jobService.createJob(payload);
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

        {/* --- Address Section --- */}
        <div className="space-y-4 rounded-md border p-4">
          <FormField
            control={form.control}
            name="useCompanyAddress"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        handleFetchCompanyAddress();
                      }
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Sử dụng địa chỉ công ty</FormLabel>
                  <FormDescription>
                    Tự động điền địa chỉ đã đăng ký của công ty bạn.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {!useCompanyAddress && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <LocationPicker
                    control={control}
                    provinceFieldName="location.province"
                    districtFieldName="location.district"
                    communeFieldName="location.commune"
                    provinces={provinces}
                    districts={districts}
                    communes={communes}
                    isLoading={isLocationLoading}
                    onProvinceChange={() => {
                        setValue('location.district', '');
                        setValue('location.commune', '');
                    }}
                    onDistrictChange={() => {
                        setValue('location.commune', '');
                    }}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ chi tiết</FormLabel>
                    <FormControl>
                      <Input placeholder="Số nhà, tên đường, phường/xã..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-map-checkbox"
                  checked={showMap}
                  onCheckedChange={setShowMap}
                />
                <label
                  htmlFor="show-map-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Hiển thị bản đồ để chọn địa chỉ chính xác
                </label>
              </div>

              {showMap && (
                 <FormField
                  control={form.control}
                  name="goong-location"
                  render={({ field }) => (
                    <GoongLocationPicker
                      value={field.value}
                      onLocationChange={(locationData) => {
                        const mapped = mapGoongLocationToStandard(locationData);
                        
                        // Set province first, which will trigger the district list update
                        setValue('location.province', mapped.province, { shouldValidate: true });

                        // Use requestAnimationFrame to delay setting district and commune
                        // This ensures React has processed the state update for the district list
                        requestAnimationFrame(() => {
                          setValue('location.district', mapped.district, { shouldValidate: true });
                          
                          requestAnimationFrame(() => {
                            setValue('location.commune', mapped.commune, { shouldValidate: true });
                          });
                        });

                        setValue('address', mapped.address || locationData.address, { shouldValidate: true });
                      }}
                    />
                  )}
                />
              )}
            </div>
          )}
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

