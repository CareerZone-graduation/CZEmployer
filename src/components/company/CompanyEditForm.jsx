import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Save, X } from 'lucide-react';

import * as companyService from '@/services/companyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [formData, setFormData] = useState({
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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Tên công ty là bắt buộc';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Tên công ty phải có ít nhất 2 ký tự';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Tên công ty không được vượt quá 200 ký tự';
    }

    if (!formData.about.trim()) {
      newErrors.about = 'Giới thiệu công ty là bắt buộc';
    } else if (formData.about.trim().length < 20) {
      newErrors.about = 'Giới thiệu công ty phải có ít nhất 20 ký tự';
    } else if (formData.about.trim().length > 2000) {
      newErrors.about = 'Giới thiệu không được vượt quá 2000 ký tự';
    }

    // Validate optional fields
    if (formData.website && formData.website.trim()) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(formData.website.trim())) {
        newErrors.website = 'URL trang web không hợp lệ';
      }
    }

    if (formData.contactInfo.email && formData.contactInfo.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contactInfo.email.trim())) {
        newErrors['contactInfo.email'] = 'Email không hợp lệ';
      }
    }

    if (formData.contactInfo.phone && formData.contactInfo.phone.trim()) {
      const phoneRegex = /^[\+]?[\d]{1,15}$/;
      if (!phoneRegex.test(formData.contactInfo.phone.trim())) {
        newErrors['contactInfo.phone'] = 'Số điện thoại không hợp lệ';
      }
    }

    if (formData.taxCode && formData.taxCode.trim().length > 50) {
      newErrors.taxCode = 'Mã số thuế không được vượt quá 50 ký tự';
    }

    if (formData.size && formData.size.trim().length > 50) {
      newErrors.size = 'Quy mô công ty không được vượt quá 50 ký tự';
    }

    // Validate address fields
    if (formData.address.street && formData.address.street.trim().length > 200) {
      newErrors['address.street'] = 'Địa chỉ không được vượt quá 200 ký tự';
    }

    if (formData.address.city && formData.address.city.trim().length > 100) {
      newErrors['address.city'] = 'Thành phố không được vượt quá 100 ký tự';
    }

    if (formData.address.country && formData.address.country.trim().length > 100) {
      newErrors['address.country'] = 'Quốc gia không được vượt quá 100 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare FormData
      const formDataToSend = new FormData();
      
      // Trim all string values and prepare company data
      const companyData = {
        name: formData.name.trim(),
        about: formData.about.trim(),
        industry: formData.industry || undefined,
        size: formData.size || undefined,
        website: formData.website.trim() || undefined,
        taxCode: formData.taxCode.trim() || undefined,
        address: {
          street: formData.address.street.trim() || undefined,
          city: formData.address.city.trim() || undefined,
          country: formData.address.country.trim() || undefined
        },
        contactInfo: {
          email: formData.contactInfo.email.trim().toLowerCase() || undefined,
          phone: formData.contactInfo.phone.trim() || undefined
        }
      };

      // Remove undefined values
      Object.keys(companyData).forEach(key => {
        if (typeof companyData[key] === 'object' && companyData[key] !== null) {
          Object.keys(companyData[key]).forEach(subKey => {
            if (companyData[key][subKey] === undefined) {
              delete companyData[key][subKey];
            }
          });
          if (Object.keys(companyData[key]).length === 0) {
            delete companyData[key];
          }
        } else if (companyData[key] === undefined) {
          delete companyData[key];
        }
      });

      formDataToSend.append('companyData', JSON.stringify(companyData));

      const response = await companyService.updateMyCompany(formDataToSend);
      
      toast.success(response.data?.message || 'Cập nhật thông tin công ty thành công');
      onSuccess?.(response.data?.data);
      onClose?.();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Cập nhật thông tin công ty thất bại';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onClose, onSuccess]);

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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Tên công ty *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên công ty"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">Giới thiệu công ty *</Label>
              <Textarea
                id="about"
                value={formData.about}
                onChange={(e) => handleInputChange('about', e.target.value)}
                placeholder="Mô tả về công ty"
                rows={4}
                className={errors.about ? 'border-red-500' : ''}
              />
              {errors.about && <p className="text-sm text-red-500">{errors.about}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Lĩnh vực</Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lĩnh vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Quy mô công ty</Label>
                <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quy mô" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.size && <p className="text-sm text-red-500">{errors.size}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                  className={errors.website ? 'border-red-500' : ''}
                />
                {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxCode">Mã số thuế</Label>
                <Input
                  id="taxCode"
                  value={formData.taxCode}
                  onChange={(e) => handleInputChange('taxCode', e.target.value)}
                  placeholder="Nhập mã số thuế"
                  className={errors.taxCode ? 'border-red-500' : ''}
                />
                {errors.taxCode && <p className="text-sm text-red-500">{errors.taxCode}</p>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                  placeholder="contact@company.com"
                  className={errors['contactInfo.email'] ? 'border-red-500' : ''}
                />
                {errors['contactInfo.email'] && <p className="text-sm text-red-500">{errors['contactInfo.email']}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                  placeholder="+84901234567"
                  className={errors['contactInfo.phone'] ? 'border-red-500' : ''}
                />
                {errors['contactInfo.phone'] && <p className="text-sm text-red-500">{errors['contactInfo.phone']}</p>}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Địa chỉ</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">Địa chỉ chi tiết</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="Số nhà, tên đường"
                className={errors['address.street'] ? 'border-red-500' : ''}
              />
              {errors['address.street'] && <p className="text-sm text-red-500">{errors['address.street']}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="Hà Nội"
                  className={errors['address.city'] ? 'border-red-500' : ''}
                />
                {errors['address.city'] && <p className="text-sm text-red-500">{errors['address.city']}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Quốc gia</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="Việt Nam"
                  className={errors['address.country'] ? 'border-red-500' : ''}
                />
                {errors['address.country'] && <p className="text-sm text-red-500">{errors['address.country']}</p>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyEditForm;
