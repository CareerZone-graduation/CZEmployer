import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
import { updateCompanySchema } from '@/utils/validation';
import { INDUSTRIES, COMPANY_SIZES } from '@/constants';
import LocationPicker from '@/components/common/LocationPicker';

const CompanyRegisterForm = ({ onRegistrationSuccess }) => {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(updateCompanySchema), // Reuse schema, or create a specific one for creation
    defaultValues: {
      name: '',
      about: '',
      industry: '',
      taxCode: '',
      size: '',
      website: '',
      location: { province: '', ward: '' },
      address: '',
      contactInfo: { email: '', phone: '' },
    },
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values) => {
    try {
      // FormData is needed if you upload files, but the logic for that is removed for simplicity here.
      // The service should be adapted to handle pure JSON if no file is sent.
      const response = await createCompany(values);
      toast.success('Đăng ký thành công!', {
        description: response.message || 'Thông tin công ty của bạn đã được gửi để xem xét.',
      });
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
      // navigate('/company-profile'); // Navigation is now handled by the layout reacting to state change
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
                            <SelectValue placeholder="Chọn lĩnh vực" />
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
                            <SelectValue placeholder="Chọn quy mô" />
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

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Địa chỉ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LocationPicker
                    control={form.control}
                    provinceFieldName="location.province"
                    wardFieldName="location.ward"
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ chi tiết</FormLabel>
                      <FormControl>
                        <Input placeholder="Số nhà, tên đường" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@company.com" {...field} />
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
                          <Input placeholder="+84901234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
