import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AttachmentUploader from '../common/AttachmentUploader';

const supportRequestSchema = z.object({
  subject: z.string()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  description: z.string()
    .min(20, 'Mô tả phải có ít nhất 20 ký tự')
    .max(5000, 'Mô tả không được vượt quá 5000 ký tự'),
  category: z.enum([
    'technical-issue',
    'account-issue',
    'payment-issue',
    'job-posting-issue',
    'application-issue',
    'general-inquiry'
  ], { required_error: 'Vui lòng chọn danh mục' })
});

const CATEGORIES = [
  { value: 'technical-issue', label: 'Vấn đề kỹ thuật' },
  { value: 'account-issue', label: 'Vấn đề tài khoản' },
  { value: 'payment-issue', label: 'Vấn đề thanh toán' },
  { value: 'job-posting-issue', label: 'Vấn đề đăng tin' },
  { value: 'application-issue', label: 'Vấn đề ứng tuyển' },
  { value: 'general-inquiry', label: 'Thắc mắc chung' }
];

const SupportRequestForm = ({ onSubmit, isLoading = false }) => {
  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(supportRequestSchema)
  });

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data, files);
      reset();
      setFiles([]);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          type="text"
          {...register('subject')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.subject ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nhập tiêu đề yêu cầu hỗ trợ"
          disabled={isLoading}
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Danh mục <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          {...register('category')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        >
          <option value="">Chọn danh mục</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Mô tả chi tiết <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={6}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Tối thiểu 20 ký tự, tối đa 5000 ký tự
        </p>
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tệp đính kèm (Tùy chọn)
        </label>
        <AttachmentUploader
          files={files}
          onChange={setFiles}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {
            reset();
            setFiles([]);
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </div>
    </form>
  );
};

export default SupportRequestForm;
