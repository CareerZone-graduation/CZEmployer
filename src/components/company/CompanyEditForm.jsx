import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { Save, X } from 'lucide-react';

import { updateCompanySchema } from '@/utils/validation';
import * as companyService from '@/services/companyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Constants for dropdown options
const INDUSTRY_OPTIONS = [
  'Công nghệ thông tin', 'Tài chính', 'Y tế', 'Giáo dục', 'Sản xuất',
  'Bán lẻ', 'Xây dựng', 'Du lịch', 'Nông nghiệp', 'Truyền thông',
  'Vận tải', 'Bất động sản', 'Dịch vụ', 'Khởi nghiệp', 'Nhà hàng - Khách sạn',
  'Bảo hiểm', 'Logistics', 'Năng lượng', 'Viễn thông', 'Dược phẩm',
  'Hóa chất', 'Ô tô - Xe máy', 'Thực phẩm - Đồ uống', 'Thời trang - Mỹ phẩm',
  'Thể thao - Giải trí', 'Công nghiệp nặng', 'Công nghiệp điện tử', 'Công nghiệp cơ khí',
  'Công nghiệp dệt may', 'Đa lĩnh vực', 'Khác'
];

const SIZE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '51-100 employees',
  '101-500 employees',
  '501-1000 employees',
  '1000+ employees'
];

const CompanyEditForm = ({ company, onClose, onSuccess }) => {
  const form = useForm({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: company?.name || '',
      about: company?.about || '',
      industry: company?.industry || '',
      size: company?.size || '',
      website: company?.website || '',
      taxCode: company?.taxCode || '',
      address: {
        street: company?.address?.street || '',
        city: company?.address?.city || '',
        country: company?.address?.country || ''
      },
      contactInfo: {
        email: company?.contactInfo?.email || '',
        phone: company?.contactInfo?.phone || ''
      }
    },
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = useCallback(async (values) => {
    try {
      const formData = new FormData();
      formData.append('companyData', JSON.stringify(values));
      
      const response = await companyService.updateMyCompany(formData);
      toast.success(response.data?.message || 'Cập nhật thông tin công ty thành công');
      onSuccess?.();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Cập nhật thông tin công ty thất bại';
      toast.error(errorMessage);
    }
  }, [onSuccess]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chỉnh sửa thông tin công ty</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lĩnh vực</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn lĩnh vực" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDUSTRY_OPTIONS.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
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
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quy mô công ty</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quy mô" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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

            <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
            <div className="grid md:grid-cols-2 gap-4">
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

            <h3 className="text-lg font-semibold">Địa chỉ</h3>
            <FormField
              control={form.control}
              name="address.street"
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
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thành phố</FormLabel>
                    <FormControl>
                      <Input placeholder="Hà Nội" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quốc gia</FormLabel>
                    <FormControl>
                      <Input placeholder="Việt Nam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : <><Save className="h-4 w-4 mr-2" />Lưu thay đổi</>}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CompanyEditForm;
