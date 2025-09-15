import { COMPANY_SIZES, experienceEnum, INDUSTRIES, jobCategoryEnum, jobTypeEnum, workTypeEnum} from '@/constants';
import { z } from 'zod';
const jobStatusEnum = ['ACTIVE', 'INACTIVE', 'EXPIRED'];


const locationSchema = z.object({
  province: z.string({ required_error: 'Tỉnh/Thành phố là bắt buộc' }).trim().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  district: z.string({ required_error: 'Quận/Huyện là bắt buộc' }).trim().min(1, 'Quận/Huyện là bắt buộc'),
  commune: z.string({ required_error: 'Phường/Xã là bắt buộc' }).trim().min(1, 'Phường/Xã là bắt buộc'),
  coordinates: z.object({
    type: z.literal('Point').default('Point'),
    coordinates: z.array(z.number()).length(2)
  }).optional(),
});

const baseJobSchema = z.object({
  title: z.string().trim().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200),
  description: z.string().trim().min(20, 'Mô tả phải có ít nhất 20 ký tự').max(5000),
  requirements: z.string().trim().min(10, 'Yêu cầu phải có ít nhất 10 ký tự').max(2000),
  benefits: z.string().trim().min(10, 'Quyền lợi phải có ít nhất 10 ký tự').max(2000),
  location: locationSchema.optional(),
  address: z.string().trim().max(200).optional(),
  useCompanyAddress: z.boolean().default(false),
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
  })
  .superRefine((data, ctx) => {
    if (!data.useCompanyAddress) {
      if (!data.location?.province) {
        ctx.addIssue({ code: 'custom', message: 'Tỉnh/Thành phố là bắt buộc', path: ['location.province'] });
      }
      if (!data.location?.district) {
        ctx.addIssue({ code: 'custom', message: 'Quận/Huyện là bắt buộc', path: ['location.district'] });
      }
      if (!data.location?.commune) {
        ctx.addIssue({ code: 'custom', message: 'Phường/Xã là bắt buộc', path: ['location.commune'] });
      }
      if (!data.address || data.address.trim() === '') {
        ctx.addIssue({ code: 'custom', message: 'Địa chỉ chi tiết là bắt buộc', path: ['address'] });
      }
    }
  });

export const updateJobSchema = baseJobSchema.partial()
  .extend({ status: z.enum(jobStatusEnum).optional() })
  .refine(data => !data.minSalary || !data.maxSalary || data.maxSalary >= data.minSalary, {
      message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
      path: ['maxSalary'],
  })
  .superRefine((data, ctx) => {
    if (data.useCompanyAddress === false) { // only validate if explicitly set to false
      if (!data.location?.province) {
        ctx.addIssue({ code: 'custom', message: 'Tỉnh/Thành phố là bắt buộc', path: ['location.province'] });
      }
      if (!data.location?.district) {
        ctx.addIssue({ code: 'custom', message: 'Quận/Huyện là bắt buộc', path: ['location.district'] });
      }
      if (!data.location?.commune) {
        ctx.addIssue({ code: 'custom', message: 'Phường/Xã là bắt buộc', path: ['location.commune'] });
      }
      if (!data.address || data.address.trim() === '') {
        ctx.addIssue({ code: 'custom', message: 'Địa chỉ chi tiết là bắt buộc', path: ['address'] });
      }
    }
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
  district: z.string({ required_error: 'Quận/Huyện là bắt buộc' }).trim().min(1, 'Quận/Huyện là bắt buộc'),
  commune: z.string({ required_error: 'Phường/Xã là bắt buộc' }).trim().min(1, 'Phường/Xã là bắt buộc'),
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
  industry: z.string().min(1  , 'Lĩnh vực là bắt buộc').max(100, 'Lĩnh vực không được vượt quá 100 ký tự').trim(),
  taxCode: z.string()
    .min(1, 'Mã số thuế là bắt buộc')
    .max(50, 'Mã số thuế không được vượt quá 50 ký tự')
    .trim(),
  size: z.string().optional(),
  website: z.string()
    .url('URL trang web không hợp lệ')
    .trim(),
  location: companyLocationSchema,
  address: z.string().trim().min(1, 'Địa chỉ chi tiết là bắt buộc').max(200),
  

  contactInfo: contactInfoSchema,
});

export const createCompanySchema = baseCompanySchema.extend({
    businessRegistrationFile: z
      .any()
      .refine((files) => files instanceof FileList && files.length > 0, 'Tệp đăng ký kinh doanh là bắt buộc.')
      .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, `Kích thước tệp tối đa là 5MB.`)
      .refine(
        (files) => ['image/jpeg', 'image/png', 'application/pdf'].includes(files?.[0]?.type),
        'Chỉ hỗ trợ các định dạng .jpg, .png, .pdf'
      ),
    email: z.string().email('Vui lòng nhập email hợp lệ').trim().toLowerCase().optional().or(z.literal('')),
    phone: z.string().regex(/^[+]?[\d]{1,15}$/, 'Vui lòng nhập số điện thoại hợp lệ').trim().optional().or(z.literal('')),
  })
  .refine(data => data.industry && INDUSTRIES.includes(data.industry), {
    message: 'Vui lòng chọn lĩnh vực',
    path: ['industry'],
  })
  .refine(data => data.size && COMPANY_SIZES.includes(data.size), {
    message: 'Vui lòng chọn quy mô',
    path: ['size'],
  });


export const updateCompanySchema = z.object({
  name: z.string({ required_error: 'Tên công ty là bắt buộc' })
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự')
    .max(200, 'Tên công ty không được vượt quá 200 ký tự')
    .trim()
    .optional(),
  about: z.string({ required_error: 'Giới thiệu công ty là bắt buộc' })
    .min(20, 'Giới thiệu công ty phải có ít nhất 20 ký tự')
    .max(2000, 'Giới thiệu không được vượt quá 2000 ký tự')
    .trim()
    .optional(),
  industry: z.enum(INDUSTRIES).optional(),
  taxCode: z.string()
    .max(50, 'Mã số thuế không được vượt quá 50 ký tự')
    .trim()
    .optional(),
  size: z.enum(COMPANY_SIZES).optional(),
  website: z.string()
    .url('URL trang web không hợp lệ')
    .trim()
    .optional(),

  // Location và address optional cho update
  location: locationSchema.optional(),
  address: z.string().trim().min(1, 'Địa chỉ chi tiết là bắt buộc').max(200).optional(),
  
  contactInfo: contactInfoSchema,
});
