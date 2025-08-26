import { z } from 'zod';
import { jobTypeEnum, workTypeEnum, experienceEnum, jobCategoryEnum } from '@/constants';

const jobStatusEnum = ['ACTIVE', 'INACTIVE', 'EXPIRED'];

const industryEnum = z.enum([
    'Công nghệ thông tin', 'Tài chính', 'Y tế', 'Giáo dục', 'Sản xuất',
    'Bán lẻ', 'Xây dựng', 'Du lịch', 'Nông nghiệp', 'Truyền thông',
    'Vận tải', 'Bất động sản', 'Dịch vụ', 'Khởi nghiệp', 'Nhà hàng - Khách sạn',
    'Bảo hiểm', 'Logistics', 'Năng lượng', 'Viễn thông', 'Dược phẩm',
    'Hóa chất', 'Ô tô - Xe máy', 'Thực phẩm - Đồ uống', 'Thời trang - Mỹ phẩm',
    'Thể thao - Giải trí', 'Công nghiệp nặng', 'Công nghiệp điện tử', 'Công nghiệp cơ khí',
    'Công nghiệp dệt may', "Đa lĩnh vực", 'Khác'
]);

// Schema for location - Simplified as the LocationPicker component ensures valid selections.
const locationSchema = z.object({
  province: z.string({ required_error: 'Tỉnh/Thành phố là bắt buộc' }).trim().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  ward: z.string({ required_error: 'Phường/Xã là bắt buộc' }).trim().min(1, 'Phường/Xã là bắt buộc'),
});

const contactInfoSchema = z.object({
    email: z.string().email('Please enter a valid email').trim().toLowerCase().optional(),
    phone: z.string().regex(/^[+]?[\d]{1,15}$/, 'Please enter a valid phone number').trim().optional(),
}).optional();

export const createJobSchema = z.object({
  title: z.string().trim().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200),
  description: z.string().trim().min(20, 'Mô tả phải có ít nhất 20 ký tự').max(5000),
  requirements: z.string().trim().min(10, 'Yêu cầu phải có ít nhất 10 ký tự').max(2000),
  benefits: z.string().trim().min(10, 'Quyền lợi phải có ít nhất 10 ký tự').max(2000),
  location: locationSchema,
  address: z.string().trim().min(1, 'Địa chỉ chi tiết là bắt buộc').max(200),
  type: z.enum(jobTypeEnum),
  workType: z.enum(workTypeEnum),
  minSalary: z.union([
    z.coerce.number().min(0, 'Mức lương không thể là số âm'),
    z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Mức lương không thể là số âm')
  ]).optional(),
  maxSalary: z.union([
    z.coerce.number().min(0, 'Mức lương không thể là số âm'),
    z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Mức lương không thể là số âm')
  ]).optional(),
  deadline: z.coerce.date().refine((date) => date > new Date(), 'Hạn chót phải là một ngày trong tương lai'),
  experience: z.enum(experienceEnum),
  category: z.enum(jobCategoryEnum),
  skills: z.array(z.string().trim().max(50, 'Kỹ năng không được vượt quá 50 ký tự')).optional(),
  approved: z.boolean().optional(),
  id: z.string().optional(),
})
.refine(data => {
  const getNumericValue = (salary) => {
    if (!salary) return null;
    if (typeof salary === 'number') return salary;
    if (typeof salary === 'string') return Number(salary);
    return null;
  };
  
  const minVal = getNumericValue(data.minSalary);
  const maxVal = getNumericValue(data.maxSalary);
  
  if (minVal !== null && maxVal !== null) {
    return maxVal >= minVal;
  }
  return true;
}, {
  message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
  path: ['maxSalary'],
});

export const updateJobSchema = z.object({
  title: z.string().trim().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200).optional(),
  description: z.string().trim().min(20, 'Mô tả phải có ít nhất 20 ký tự').max(5000).optional(),
  requirements: z.string().trim().min(10, 'Yêu cầu phải có ít nhất 10 ký tự').max(2000).optional(),
  benefits: z.string().trim().min(10, 'Quyền lợi phải có ít nhất 10 ký tự').max(2000).optional(),
  location: locationSchema.optional(),
  address: z.string().trim().min(1, 'Địa chỉ chi tiết là bắt buộc').max(200).optional(),
  type: z.enum(jobTypeEnum).optional(),
  workType: z.enum(workTypeEnum).optional(),
  minSalary: z.union([
    z.coerce.number().min(0, 'Mức lương không thể là số âm'),
    z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Mức lương không thể là số âm')
  ]).optional(),
  maxSalary: z.union([
    z.coerce.number().min(0, 'Mức lương không thể là số âm'),
    z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, 'Mức lương không thể là số âm')
  ]).optional(),
  deadline: z.coerce.date().refine((date) => date > new Date(), 'Hạn chót phải là một ngày trong tương lai').optional(),
  experience: z.enum(experienceEnum).optional(),
  category: z.enum(jobCategoryEnum).optional(),
  status: z.enum(jobStatusEnum).optional(),
  skills: z.array(z.string().trim().max(50, 'Kỹ năng không được vượt quá 50 ký tự')).optional(),
  approved: z.boolean().optional(),
  recruiterProfileId: z.string().optional(),
  id: z.string().optional(),
})
.refine(data => {
  const getNumericValue = (salary) => {
    if (!salary) return null;
    if (typeof salary === 'number') return salary;
    if (typeof salary === 'string') return Number(salary);
    return null;
  };
  
  const minVal = getNumericValue(data.minSalary);
  const maxVal = getNumericValue(data.maxSalary);
  
  if (minVal !== null && maxVal !== null) {
    return maxVal >= minVal;
  }
  return true;
}, {
    message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
    path: ['maxSalary'],
});

export const jobQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(jobStatusEnum).optional(),
  sortBy: z.string().optional(),
});

export const applyToJobSchema = z.object({
  cvId: z.string().trim().optional(),
  cvTemplateId: z.string().trim().optional(),
  coverLetter: z.string().trim().max(2000, 'Thư xin việc không được vượt quá 2000 ký tự').optional(),
  candidateName: z.string().trim().min(1, 'Họ tên là bắt buộc').max(100, 'Họ tên không được vượt quá 100 ký tự'),
  candidateEmail: z.string().trim().email('Email không hợp lệ'),
  candidatePhone: z.string().trim().regex(/^[+]?[\d]{1,15}$/, 'Số điện thoại không hợp lệ'),
}).refine(data => {
  return (data.cvId && !data.cvTemplateId) || (!data.cvId && data.cvTemplateId);
}, {
  message: 'Bạn phải cung cấp `cvId` (cho CV tải lên) hoặc `cvTemplateId` (cho CV tạo từ mẫu). Không thể cung cấp cả hai hoặc không cung cấp trường nào.',
  path: ['cvId'],
});

const baseCompanySchema = z.object({
  name: z.string({ required_error: 'Tên công ty là bắt buộc' })
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự')
    .max(200, 'Tên công ty không được vượt quá 200 ký tự')
    .trim(),
  about: z.string({ required_error: 'Giới thiệu công ty là bắt buộc' })
    .min(20, 'Giới thiệu công ty phải có ít nhất 20 ký tự')
    .max(2000, 'Giới thiệu không được vượt quá 2000 ký tự')
    .trim(),
  industry: industryEnum.optional(),
  taxCode: z.string()
    .max(50, 'Mã số thuế không được vượt quá 50 ký tự')
    .trim()
    .optional(),
  size: z.string()
    .max(50, 'Quy mô công ty không được vượt quá 50 ký tự')
    .trim()
    .optional(),
  website: z.string()
    .url('URL trang web không hợp lệ')
    .trim()
    .optional(),
  location: locationSchema,
  address: z.string().max(200, 'Địa chỉ chi tiết không được quá 200 ký tự').trim().optional(),
  contactInfo: contactInfoSchema,
});

export const createCompanySchema = baseCompanySchema;
export const updateCompanySchema = baseCompanySchema;
