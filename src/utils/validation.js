import { z } from 'zod';
import { jobTypeEnum, workTypeEnum, experienceEnum, jobCategoryEnum, INDUSTRIES, COMPANY_SIZES } from '@/constants';

// =================================================================
// JOB RELATED SCHEMAS
// =================================================================

const jobStatusEnum = ['ACTIVE', 'INACTIVE', 'EXPIRED'];

// LocationPicker component ensures valid selections, so we only need to check for presence.
const locationSchema = z.object({
  province: z.string({ required_error: 'Tỉnh/Thành phố là bắt buộc' }).trim().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  ward: z.string({ required_error: 'Phường/Xã là bắt buộc' }).trim().min(1, 'Phường/Xã là bắt buộc'),
});

const baseJobSchema = z.object({
  title: z.string().trim().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200),
  description: z.string().trim().min(20, 'Mô tả phải có ít nhất 20 ký tự').max(5000),
  requirements: z.string().trim().min(10, 'Yêu cầu phải có ít nhất 10 ký tự').max(2000),
  benefits: z.string().trim().min(10, 'Quyền lợi phải có ít nhất 10 ký tự').max(2000),
  location: locationSchema,
  address: z.string().trim().min(1, 'Địa chỉ chi tiết là bắt buộc').max(200),
  type: z.enum(jobTypeEnum, { required_error: 'Loại công việc là bắt buộc' }),
  workType: z.enum(workTypeEnum, { required_error: 'Hình thức làm việc là bắt buộc' }),
  minSalary: z.coerce.number().min(0, 'Mức lương không thể là số âm').optional(),
  maxSalary: z.coerce.number().min(0, 'Mức lương không thể là số âm').optional(),
  deadline: z.coerce.date().refine((date) => date > new Date(), 'Hạn chót phải là một ngày trong tương lai'),
  experience: z.enum(experienceEnum, { required_error: 'Cấp bậc kinh nghiệm là bắt buộc' }),
  category: z.enum(jobCategoryEnum, { required_error: 'Ngành nghề là bắt buộc' }),
  skills: z.array(z.string().trim().max(50, 'Kỹ năng không được vượt quá 50 ký tự')).optional(),
});

export const createJobSchema = baseJobSchema
  .refine(data => !data.minSalary || !data.maxSalary || data.maxSalary >= data.minSalary, {
    message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
    path: ['maxSalary'],
  });

export const updateJobSchema = baseJobSchema.partial()
  .extend({ status: z.enum(jobStatusEnum).optional() })
  .refine(data => !data.minSalary || !data.maxSalary || data.maxSalary >= data.minSalary, {
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
  candidateName: z.string({required_error: "Họ tên là bắt buộc"}).trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên không được vượt quá 100 ký tự'),
  candidateEmail: z.string({required_error: "Email là bắt buộc"}).trim().email('Email không hợp lệ'),
  candidatePhone: z.string({required_error: "Số điện thoại là bắt buộc"}).trim().regex(/^[+]?[\d]{1,15}$/, 'Số điện thoại không hợp lệ'),
}).refine(data => {
  return (data.cvId && !data.cvTemplateId) || (!data.cvId && data.cvTemplateId);
}, {
  message: 'Bạn phải cung cấp `cvId` (cho CV tải lên) hoặc `cvTemplateId` (cho CV tạo từ mẫu). Không thể cung cấp cả hai hoặc không cung cấp trường nào.',
  path: ['cvId'],
});


// =================================================================
// COMPANY RELATED SCHEMAS
// =================================================================

const companyLocationSchema = z.object({
  province: z.string({ required_error: 'Tỉnh/Thành phố là bắt buộc' }).trim().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  ward: z.string({ required_error: 'Phường/Xã là bắt buộc' }).trim().min(1, 'Phường/Xã là bắt buộc'),
});

const contactInfoSchema = z.object({
    email: z.string().email('Vui lòng nhập email hợp lệ').trim().toLowerCase().optional(),
    phone: z.string().regex(/^[+]?[\d]{1,15}$/, 'Vui lòng nhập số điện thoại hợp lệ').trim().optional(),
}).optional();

const baseCompanySchema = z.object({
  name: z.string({ required_error: 'Tên công ty là bắt buộc' })
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự')
    .max(200, 'Tên công ty không được vượt quá 200 ký tự')
    .trim(),
  about: z.string({ required_error: 'Giới thiệu công ty là bắt buộc' })
    .min(20, 'Giới thiệu công ty phải có ít nhất 20 ký tự')
    .max(2000, 'Giới thiệu không được vượt quá 2000 ký tự')
    .trim(),
  industry: z.enum(INDUSTRIES, { required_error: 'Ngành nghề là bắt buộc' }),
  taxCode: z.string()
    .max(50, 'Mã số thuế không được vượt quá 50 ký tự')
    .trim()
    .optional(),
  size: z.enum(COMPANY_SIZES).optional(),
  website: z.string()
    .url('URL trang web không hợp lệ')
    .trim()
    .optional()
    .or(z.literal('')),
  location: companyLocationSchema,
  address: z.string().max(200, 'Địa chỉ chi tiết không được quá 200 ký tự').trim().optional(),
  contactInfo: contactInfoSchema,
});

export const createCompanySchema = baseCompanySchema;
export const updateCompanySchema = baseCompanySchema.partial();
