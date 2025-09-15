import { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

import { updateCompanySchema } from '@/utils/validation';
import { getProvinces, getDistrictsForProvince, getCommunesForDistrict } from '@/utils/locationUtils';
import * as companyService from '@/services/companyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
      commune: company?.location?.commune || ''
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
  }, [defaultValues, form]);

  const { isSubmitting } = form.formState;
  const {
    provinces,
    districts,
    communes,
    handleProvinceChange,
    handleDistrictChange
  } = useLocationData(form);

  const handleSubmit = useCallback(async (values) => {
    try {
      // Tạo FormData với companyData key chứa JSON
      const formData = new FormData();
      formData.append('companyData', JSON.stringify(values));
      
      const response = await companyService.updateMyCompany(formData);
      toast.success('Cập nhật thành công!', {
        description: response.data?.message || 'Thông tin công ty đã được cập nhật.'
      });
      onSuccess?.();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Cập nhật thông tin công ty thất bại';
      toast.error('Cập nhật thất bại', {
        description: errorMessage
      });
    }
  }, [onSuccess]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
