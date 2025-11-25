import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createCompany } from '@/services/companyService';
import { createCompanySchema } from '@/utils/validation';
import { INDUSTRIES, COMPANY_SIZES } from '@/constants';
import LocationPicker from '@/components/common/LocationPicker';
import { useLocationData } from '@/hooks/useLocationData';
import GoongLocationPicker from '@/components/common/GoongLocationPicker';
import { mapGoongLocationToStandard } from '@/utils/locationUtils';
import { useState } from 'react';

const CompanyRegisterForm = () => {
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const form = useForm({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      about: '',
      industry: '',
      size: '',
      website: '',
      taxCode: '',
      address: '',
      location: {
        province: '',
        district: '',
        commune: '',
        coordinates: undefined,
      },
      businessRegistrationFile: null,
      email: '',
      phone: '',
    },
  });

  const watchedProvince = useWatch({ control: form.control, name: 'location.province' });
  const watchedDistrict = useWatch({ control: form.control, name: 'location.district' });
  const { provinces, districts, communes } = useLocationData(watchedProvince, watchedDistrict);

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values) => {
    const { businessRegistrationFile, address, location, email, phone, ...rest } = values;

    const companyData = {
      ...rest,
      address,
      location,
      contactInfo: {
        email,
        phone,
      },
    };

    const formData = new FormData();
    formData.append('companyData', JSON.stringify(companyData));

    // Handle FileList from register
    if (businessRegistrationFile && businessRegistrationFile.length > 0) {
      formData.append('businessRegistrationFile', businessRegistrationFile[0]);
    }

    try {
      await createCompany(formData);
      toast.success('Đăng ký công ty thành công! Vui lòng chờ duyệt.');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đã có lỗi xảy ra.';
      toast.error('Đăng ký thất bại', {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Đăng ký thông tin công ty</CardTitle>
          <CardDescription>
            Hoàn thiện thông tin để bắt đầu tuyển dụng nhân tài.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
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
                        <Textarea placeholder="Mô tả về công ty, sứ mệnh, tầm nhìn..." rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Business Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lĩnh vực</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vui lòng chọn lĩnh vực" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                          ))}
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Vui lòng chọn quy mô" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMPANY_SIZES.map((size) => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
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
                        <Input placeholder="Nhập mã số thuế" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email liên hệ</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Địa chỉ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LocationPicker
                    control={form.control}
                    provinceFieldName="location.province"
                    districtFieldName="location.district"
                    communeFieldName="location.commune"
                    provinces={provinces}
                    districts={districts}
                    communes={communes}
                    onProvinceChange={() => {
                      form.setValue('location.district', '');
                      form.setValue('location.commune', '');
                    }}
                    onDistrictChange={() => {
                      form.setValue('location.commune', '');
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Địa chỉ chi tiết (Số nhà, tên đường)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: 123 Đường Nguyễn Huệ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="show-map-checkbox-register"
                  checked={showMap}
                  onChange={(e) => setShowMap(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="show-map-checkbox-register"
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

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Giấy tờ pháp lý</h3>
                <FormItem>
                  <FormLabel>Giấy phép đăng ký kinh doanh *</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      {...form.register('businessRegistrationFile')}
                    />
                  </FormControl>
                  <FormMessage>
                    {form.formState.errors.businessRegistrationFile?.message}
                  </FormMessage>
                </FormItem>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                  {isSubmitting ? 'Đang xử lý...' : <><Save className="h-4 w-4 mr-2" />Đăng ký</>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyRegisterForm;
