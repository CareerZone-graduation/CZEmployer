import apiClient from './apiClient';

/**
 * Lấy profile công ty của người dùng hiện tại (recruiter).
 * @returns {Promise<import('axios').AxiosResponse<{
 *   success: boolean,
 *   message: string,
 *   data: {
 *     _id: string,
 *     name: string,
 *     about: string,
 *     industry: string,
 *     size: string,
 *     website: string,
 *     logo: string,
 *     verified: boolean,
 *     taxCode: string,
 *     businessRegistrationUrl: string,
 *     representativeName: string,
 *     createdAt: string,
 *     updatedAt: string,
 *     address: {
 *       street: string,
 *       city: string,
 *       country: string
 *     },
 *     contactInfo: {
 *       email: string,
 *       phone: string
 *     }
 *   }
 * }>>}
 */
export const getMyCompany = async() => apiClient.get('/companies/my-company');


/**
 * Cập nhật profile công ty của người dùng hiện tại (recruiter) bằng FormData.
 * @param {FormData} formData - FormData chứa companyData (JSON string) và các file nếu có.
 * @param {object} axiosConfig - Cấu hình Axios tùy chọn.
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const updateMyCompany = (formData) =>
  apiClient.patch('/companies/my-company', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

/**
 * Tạo mới một công ty với FormData.
 * @param {FormData} formData - FormData chứa companyData (JSON string) và businessRegistrationFile (file).
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const createCompany = (formData) =>
  apiClient.post('/companies', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

/**
 * Cập nhật logo công ty.
 * @param {FormData} formData
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const updateMyCompanyLogo = (formData) =>
  apiClient.post('/companies/my-company/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

/**
 * Lấy địa chỉ công ty của người dùng hiện tại (recruiter).
 * @returns {Promise<import('axios').AxiosResponse<any>>}
 */
export const getMyCompanyAddress = async () => apiClient.get('/companies/my-company/address');
