import { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import GoongLocationPicker from '@/components/common/GoongLocationPicker';
import { mapGoongLocationToStandard } from '@/utils/locationUtils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save, Upload, Camera } from 'lucide-react';

import { updateCompanySchema } from '@/utils/validation';
import { getProvinces, getDistrictsForProvince, getCommunesForDistrict } from '@/utils/locationUtils';
import * as companyService from '@/services/companyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { INDUSTRIES, COMPANY_SIZES } from '@/constants';
import LocationPicker from '@/components/common/LocationPicker';

// Helper function to validate company size
const getValidSize = (companySize) => {
  if (companySize && COMPANY_SIZES.includes(companySize)) {
    return companySize;
  }
  return '11-50 nhân viên'; // Default value
};

// Custom hook to manage location data
const useLocationData = (form) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [communes, setCommunes] = useState([]);

  const selectedProvince = form.watch('location.province');
  const selectedDistrict = form.watch('location.district');

  // Populate provinces on mount
  useEffect(() => {
    setProvinces(getProvinces());
  }, []);

  // Populate districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      setDistricts(getDistrictsForProvince(selectedProvince));
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  // Populate communes when district changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict) {
      setCommunes(getCommunesForDistrict(selectedProvince, selectedDistrict));
    } else {
      setCommunes([]);
    }
  }, [selectedProvince, selectedDistrict]);

  // Handler for when user MANUALLY changes province in the picker
  const handleProvinceChange = () => {
    form.setValue('location.district', '');
    form.setValue('location.commune', '');
  };

  // Handler for when user MANUALLY changes district in the picker
  const handleDistrictChange = () => {
    form.setValue('location.commune', '');
  };

  return {
    provinces,
    districts,
    communes,
    handleProvinceChange,
    handleDistrictChange,
  };
};

const CompanyEditForm = ({ company, onSuccess }) => {
  const [showMap, setShowMap] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(company?.logo || '');
  const fileInputRef = useRef(null);

  const defaultValues = useMemo(() => ({
    name: company?.name || '',
    about: company?.about || '',
    industry: company?.industry || '',
    size: getValidSize(company?.size),
    website: company?.website || '',
    taxCode: company?.taxCode || '',
    location: {
      province: company?.location?.province || '',
      district: company?.location?.district || '',
      commune: company?.location?.commune || '',
      coordinates: company?.location?.coordinates || undefined,
    },
    address: company?.address || '',
    contactInfo: {
      email: company?.contactInfo?.email || '',
      phone: company?.contactInfo?.phone || ''
    }
  }), [company]);

  const industryOptions = useMemo(() =>
    INDUSTRIES.map((industry) => (
      <SelectItem key={industry} value={industry}>
        {industry}
      </SelectItem>
    )), []
  );

  const companySizeOptions = useMemo(() =>
    COMPANY_SIZES.map((size) => (
      <SelectItem key={size} value={size}>
        {size}
      </SelectItem>
    )), []
  );

  const form = useForm({
    resolver: zodResolver(updateCompanySchema),
    defaultValues,
    // Re-initialize form when defaultValues (i.e., company prop) changes
    enableReinitialize: true,
  });

  // Reset form when company data changes (more robust with enableReinitialize)
  useEffect(() => {
    form.reset(defaultValues);
    setLogoPreview(company?.logo || '');
    setLogoFile(null);
  }, [defaultValues, form, company]);

  const { isSubmitting } = form.formState;
  const {
    provinces,
    districts,
    communes,
    handleProvinceChange,
    handleDistrictChange
  } = useLocationData(form);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size if needed
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const [businessLicenseFile, setBusinessLicenseFile] = useState(null);
  const [businessLicensePreview, setBusinessLicensePreview] = useState(company?.businessRegistrationUrl || null);

  const handleBusinessLicenseChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Kích thước tài liệu không được vượt quá 10MB');
        return;
      }
      setBusinessLicenseFile(file);
      // For preview if it's an image, or just show name if pdf
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setBusinessLicensePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setBusinessLicensePreview(null); // Or some icon
      }
    }
  };

  const handleSubmit = useCallback(async (values) => {
    try {
      // 1. Update general company info
      const formData = new FormData();
      formData.append('companyData', JSON.stringify(values));

      // Append business license file if selected
      if (businessLicenseFile) {
        formData.append('businessRegistrationFile', businessLicenseFile);
      }

      await companyService.updateMyCompany(formData);

      // 2. Update logo if selected
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        await companyService.updateMyCompanyLogo(logoFormData);
      }

      toast.success('Cập nhật thành công!', {
        description: 'Thông tin công ty đã được cập nhật. Nếu có thay đổi thông tin pháp lý, công ty sẽ cần được xác thực lại.'
      });
      onSuccess?.();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Cập nhật thông tin công ty thất bại';
      toast.error('Cập nhật thất bại', {
        description: errorMessage
      });
    }
  }, [onSuccess, logoFile, businessLicenseFile]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              Lưu ý: Việc thay đổi các thông tin quan trọng như <span className="font-semibold">Tên công ty, Mã số thuế, Giấy phép kinh doanh, hoặc Địa chỉ</span> sẽ khiến trạng thái xác thực của công ty trở về <span className="font-semibold">Chưa xác thực</span> và cần được Ban quản trị phê duyệt lại.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

          {/* Logo Upload Section */}
          <div className="flex flex-col items-center justify-center space-y-4 pb-6 border-b">
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
              <Avatar className="h-32 w-32 border-2 border-gray-200">
                <AvatarImage src={logoPreview} alt="Company Logo" className="object-cover" />
                <AvatarFallback className="text-4xl bg-gray-100">
                  {defaultValues.name ? defaultValues.name.charAt(0).toUpperCase() : 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>
            <div className="text-center">
              <Button type="button" variant="outline" size="sm" onClick={triggerFileInput}>
                <Upload className="h-4 w-4 mr-2" />
                Thay đổi logo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Hỗ trợ định dạng JPG, PNG. Tối đa 5MB.
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên công ty *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên công ty" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giới thiệu công ty *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả về công ty" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Business Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lĩnh vực</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn lĩnh vực" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industryOptions}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quy mô công ty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn quy mô" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companySizeOptions}
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
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="taxCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã số thuế</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập mã số thuế" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Business License Upload */}
          <div className="space-y-2">
            <FormLabel>Giấy phép kinh doanh (Cập nhật nếu thay đổi)</FormLabel>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleBusinessLicenseChange}
                className="cursor-pointer"
              />
              {businessLicensePreview && typeof businessLicensePreview === 'string' && businessLicensePreview.startsWith('http') && (
                <a href={businessLicensePreview} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm whitespace-nowrap">
                  Xem hiện tại
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tải lên bản scan hoặc ảnh chụp giấy phép kinh doanh (PDF, JPG, PNG). Tối đa 10MB.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Thông tin liên hệ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactInfo.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@company.com" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactInfo.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="+84901234567" {...field} className="w-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Địa chỉ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LocationPicker
                control={form.control}
                provinceFieldName="location.province"
                districtFieldName="location.district"
                communeFieldName="location.commune"
                provinces={provinces}
                districts={districts}
                communes={communes}
                onProvinceChange={handleProvinceChange}
                onDistrictChange={handleDistrictChange}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ chi tiết</FormLabel>
                  <FormControl>
                    <Input placeholder="Số nhà, tên đường" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="show-map-checkbox-edit"
                checked={showMap}
                onChange={(e) => setShowMap(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="show-map-checkbox-edit"
                className="text-sm font-medium text-gray-700"
              >
                Hiển thị bản đồ để chọn địa chỉ chính xác hơn
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
                      form.setValue('location.province', mapped.province, { shouldValidate: true });
                      form.setValue('address', locationData.address, { shouldValidate: true });
                      form.setValue('location.coordinates', {
                        type: 'Point',
                        coordinates: [locationData.lng, locationData.lat]
                      });
                      requestAnimationFrame(() => {
                        form.setValue('location.district', mapped.district, { shouldValidate: true });
                        requestAnimationFrame(() => {
                          form.setValue('location.commune', mapped.commune, { shouldValidate: true });
                        });
                      });
                    }}
                  />
                )}
              />
            )}
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? 'Đang lưu...' : <><Save className="h-4 w-4 mr-2" />Lưu thay đổi</>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CompanyEditForm;
