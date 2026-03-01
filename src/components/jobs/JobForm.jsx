import React, { useCallback, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Sparkles } from 'lucide-react';
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
import * as aiService from '@/services/aiService';
import AutoSuggestInput from './AutoSuggestInput';
import SmartAutocompleteInput from './SmartAutocompleteInput';
import AutoSuggestTextarea from './AutoSuggestTextarea';
import { 
  JOB_TITLE_SUGGESTIONS, 
  QUICK_TEMPLATES,
  DESCRIPTION_SUGGESTIONS,
  REQUIREMENTS_SUGGESTIONS,
  BENEFITS_SUGGESTIONS
} from '@/constants/jobTemplates';
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
import SearchableSelect from '@/components/ui/searchable-select';
import {
  mapGoongLocationToStandard,
  getProvinces,
  getDistrictsForProvince,
  getCommunesForDistrict
} from '@/utils/locationUtils';


const JobForm = ({ onSuccess, job }) => {
  const isEditMode = !!job;
  const [showMap, setShowMap] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [previousValues, setPreviousValues] = useState(null); // Store previous values for undo

  // State for location dropdowns
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [isLocationLoading, setIsLocationLoading] = useState(true);


  const { user: authUser } = useSelector((state) => state.auth);
  const companyProfile = authUser?.profile.company;
  console.log("Company Profile:", companyProfile);

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
          coordinates: job.location?.coordinates || undefined,
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
          coordinates: undefined,
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

  const { isSubmitting, control, setValue } = form;
  const useCompanyAddress = useWatch({ control, name: 'useCompanyAddress' });
  const watchedProvince = useWatch({ control, name: 'location.province' });
  const watchedDistrict = useWatch({ control, name: 'location.district' });
  const watchedTitle = useWatch({ control, name: 'title' });
  

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


  // Effect to handle "Use Company Address" checkbox
  useEffect(() => {
    if (useCompanyAddress) {
      if (companyProfile) {
        const { location: companyLocation, address: companyAddress } = companyProfile;

        setValue('location.province', companyLocation?.province || '', { shouldValidate: true });
        setValue('address', companyAddress || '', { shouldValidate: true });
        if (companyLocation?.coordinates) {
          setValue('location.coordinates', companyLocation.coordinates);
        }

        requestAnimationFrame(() => {
          setValue('location.district', companyLocation?.district || '', { shouldValidate: true });
          requestAnimationFrame(() => {
            setValue('location.commune', companyLocation?.commune || '', { shouldValidate: true });
          });
        });
      } else {
        toast.error('Chưa có thông tin công ty', {
          description: 'Vui lòng cập nhật thông tin công ty để sử dụng tính năng này.',
        });
        setValue('useCompanyAddress', false); // Uncheck the box
      }
    }
  }, [useCompanyAddress, companyProfile, setValue]);

  // Auto-generate suggestions when title changes
  useEffect(() => {
    const generateSuggestions = async () => {
      // Only generate if title is long enough and fields are empty
      if (!watchedTitle || watchedTitle.trim().length < 5) return;
      
      const currentDescription = form.getValues('description');
      const currentRequirements = form.getValues('requirements');
      const currentBenefits = form.getValues('benefits');
      
      // Only auto-fill if all fields are empty
      if (currentDescription || currentRequirements || currentBenefits) return;
      
      // Debounce: wait for user to stop typing
      const timeoutId = setTimeout(async () => {
        try {
          setIsGeneratingSuggestions(true);
          const response = await aiService.generateSmartSuggestions(watchedTitle);
          
          if (response.success && response.data) {
            // Only fill if fields are still empty
            if (!form.getValues('description') && response.data.description) {
              form.setValue('description', response.data.description);
            }
            if (!form.getValues('requirements') && response.data.requirements) {
              form.setValue('requirements', response.data.requirements);
            }
            if (!form.getValues('benefits') && response.data.benefits) {
              form.setValue('benefits', response.data.benefits);
            }
            
            toast.success('Đã tự động điền nội dung phù hợp!', {
              description: 'Bạn có thể chỉnh sửa hoặc dùng AI để cải thiện thêm'
            });
          }
        } catch (error) {
          console.error('Error generating suggestions:', error);
          // Silent fail - don't show error to user for auto-suggestions
        } finally {
          setIsGeneratingSuggestions(false);
        }
      }, 2000); // Wait 2 seconds after user stops typing
      
      return () => clearTimeout(timeoutId);
    };
    
    generateSuggestions();
  }, [form, watchedTitle]);

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

  const handleEnhanceWithAI = useCallback(async () => {
    try {
      const currentValues = form.getValues();
      
      // Check if there's enough content to enhance
      const hasContent = currentValues.title || currentValues.description || 
                        currentValues.requirements || currentValues.benefits;
      
      if (!hasContent) {
        toast.error('Vui lòng nhập nội dung trước khi sử dụng AI');
        return;
      }

      // Save current values for undo
      setPreviousValues({
        title: currentValues.title,
        description: currentValues.description,
        requirements: currentValues.requirements,
        benefits: currentValues.benefits,
      });

      setIsEnhancing(true);
      toast.info('Đang cải thiện nội dung với AI...', {
        description: 'Vui lòng đợi trong giây lát'
      });

      // Prepare data for AI enhancement
      const dataToEnhance = {
        title: currentValues.title,
        description: currentValues.description,
        requirements: currentValues.requirements,
        benefits: currentValues.benefits,
      };

      console.log('Sending data to AI:', dataToEnhance);
      const response = await aiService.enhanceJobContent(dataToEnhance);
      console.log('AI response:', response);
      
      if (response.success && response.data) {
        // Update form with enhanced content
        if (response.data.title) form.setValue('title', response.data.title);
        if (response.data.description) form.setValue('description', response.data.description);
        if (response.data.requirements) form.setValue('requirements', response.data.requirements);
        if (response.data.benefits) form.setValue('benefits', response.data.benefits);
        
        toast.success('Cải thiện nội dung thành công!', {
          description: 'Nội dung đã được tối ưu hóa bởi AI. Nhấn "Hoàn tác" nếu không hài lòng.'
        });
      } else {
        console.error('Invalid response format:', response);
        toast.error('Phản hồi không hợp lệ từ server');
        setPreviousValues(null); // Clear previous values on error
      }
    } catch (error) {
      console.error('Error enhancing with AI:', error);
      console.error('Error response:', error.response);
      toast.error('Không thể cải thiện nội dung', {
        description: error.response?.data?.message || error.message || 'Vui lòng thử lại sau'
      });
      setPreviousValues(null); // Clear previous values on error
    } finally {
      setIsEnhancing(false);
    }
  }, [form]);

  const handleUndo = useCallback(() => {
    if (!previousValues) {
      toast.error('Không có gì để hoàn tác');
      return;
    }

    // Restore previous values
    if (previousValues.title !== undefined) form.setValue('title', previousValues.title);
    if (previousValues.description !== undefined) form.setValue('description', previousValues.description);
    if (previousValues.requirements !== undefined) form.setValue('requirements', previousValues.requirements);
    if (previousValues.benefits !== undefined) form.setValue('benefits', previousValues.benefits);
    
    // Clear previous values
    setPreviousValues(null);
    
    toast.success('Đã hoàn tác thành công!', {
      description: 'Nội dung đã được khôi phục về trước khi enhance'
    });
  }, [form, previousValues]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {!isEditMode && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-semibold">
                💰
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900">Thông báo về chi phí đăng tin</h4>
                <p className="mt-1 text-sm text-amber-800">
                  Đăng một tin tuyển dụng sẽ tốn <strong>100 xu</strong>. Vui lòng đảm bảo tài khoản của bạn có đủ số dư trước khi đăng tin.
                </p>
              </div>
            </div>
          </div>
        )}

        {isEditMode && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white text-sm font-semibold">
                ⚠️
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900">Lưu ý khi cập nhật</h4>
                <p className="mt-1 text-sm text-yellow-800">
                  Việc thay đổi bất kỳ thông tin nào sau đây sẽ khiến tin tuyển dụng phải <strong>chờ duyệt lại</strong>: Tiêu đề, Mô tả, Yêu cầu, Quyền lợi, Kỹ năng, Mức lương, Kinh nghiệm, Ngành nghề, Loại công việc, Hình thức làm việc, và Địa điểm.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
              ✨
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">
                    {isGeneratingSuggestions ? '🤖 Đang tự động điền nội dung...' : 'Cải thiện nội dung với AI'}
                  </h4>
                  <p className="mt-1 text-sm text-blue-800">
                    {isGeneratingSuggestions 
                      ? 'AI đang tạo nội dung phù hợp dựa trên tiêu đề công việc...'
                      : 'Nhập tiêu đề công việc để tự động điền, hoặc nhấn nút để AI tối ưu hóa nội dung.'
                    }
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleEnhanceWithAI}
                    disabled={isEnhancing || isGeneratingSuggestions}
                    className="whitespace-nowrap"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isEnhancing ? 'Đang xử lý...' : 'Enhance with AI'}
                  </Button>
                  {previousValues && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleUndo}
                      className="whitespace-nowrap text-orange-600 hover:text-orange-700"
                    >
                      ↶ Hoàn tác
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề công việc</FormLabel>
              <FormControl>
                <SmartAutocompleteInput 
                  placeholder="Gõ 'l' để xem gợi ý: Lập trình viên, Lễ tân..." 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Gợi ý từ công việc thực tế. Gõ 1 ký tự để xem danh sách công việc phổ biến.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Mô tả công việc</FormLabel>
               
              </div>
              <FormControl>
                <AutoSuggestTextarea
                  placeholder="Gõ 'Chúng' để xem gợi ý..."
                  className="min-h-[150px]"
                  suggestions={DESCRIPTION_SUGGESTIONS}
                  minTriggerLength={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>Mô tả chi tiết về công việc và trách nhiệm. Gõ vài từ và nhấn Tab để chấp nhận gợi ý.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Yêu cầu công việc</FormLabel>
               
              </div>
              <FormControl>
                <AutoSuggestTextarea
                  placeholder="Gõ 'Yêu' để xem gợi ý..."
                  className="min-h-[150px]"
                  suggestions={REQUIREMENTS_SUGGESTIONS}
                  minTriggerLength={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>Các kỹ năng và kinh nghiệm cần thiết cho vị trí. Gõ vài từ và nhấn Tab để chấp nhận gợi ý.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="benefits"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Quyền lợi</FormLabel>
              
              </div>
              <FormControl>
                <AutoSuggestTextarea
                  placeholder="Gõ '- Lương' để xem gợi ý..."
                  className="min-h-[150px]"
                  suggestions={BENEFITS_SUGGESTIONS}
                  minTriggerLength={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>Các phúc lợi mà ứng viên sẽ nhận được. Gõ vài từ và nhấn Tab để chấp nhận gợi ý.</FormDescription>
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
                      field.onChange(checked);
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
                disabled={useCompanyAddress}
                onProvinceChange={() => {
                  if (!useCompanyAddress) {
                    setValue('location.district', '');
                    setValue('location.commune', '');
                  }
                }}
                onDistrictChange={() => {
                  if (!useCompanyAddress) {
                    setValue('location.commune', '');
                  }
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
                    <Input
                      placeholder="Số nhà, tên đường, phường/xã..."
                      {...field}
                      disabled={useCompanyAddress}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!useCompanyAddress && (
              <>
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
                          console.log("Selected location data:", locationData);
                          const mapped = mapGoongLocationToStandard(locationData);

                          setValue('location.province', mapped.province, { shouldValidate: true });

                          requestAnimationFrame(() => {
                            setValue('location.district', mapped.district, { shouldValidate: true });

                            requestAnimationFrame(() => {
                              setValue('location.commune', mapped.commune, { shouldValidate: true });
                            });
                          });

                          setValue('address', mapped.address || locationData.address, { shouldValidate: true });
                          setValue('location.coordinates', {
                            type: 'Point',
                            coordinates: [locationData.lng, locationData.lat]
                          });
                        }}
                      />
                    )}
                  />
                )}
              </>
            )}
          </div>
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
                <FormLabel>Lương tối thiểu (VNĐ)</FormLabel>
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
                <FormLabel>Lương tối đa (VNĐ)</FormLabel>
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
                    startMonth={new Date(new Date().getFullYear(), 0)}
                    endMonth={new Date(new Date().getFullYear() + 5, 11)}
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
                <SearchableSelect
                  options={jobCategoryEnum.map((cat) => ({
                    label: jobCategoryMap[cat],
                    value: cat
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Chọn ngành nghề"
                  searchPlaceholder="Tìm ngành nghề..."
                />
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

