/**
 * Credit Transaction Constants
 * Định nghĩa các hằng số cho hệ thống giao dịch xu (credit)
 */

// Transaction types
export const TRANSACTION_TYPES = {
    DEPOSIT: 'DEPOSIT',
    USAGE: 'USAGE'
};

// Transaction categories
export const TRANSACTION_CATEGORIES = {
    // Deposit categories
    RECHARGE: 'RECHARGE',

    // Usage categories
    JOB_VIEW: 'JOB_VIEW',
    CV_UNLOCK: 'CV_UNLOCK',
    PROFILE_BOOST: 'PROFILE_BOOST',
    JOB_POST: 'JOB_POST',
    PREMIUM_FEATURE: 'PREMIUM_FEATURE'
};

// Category display names (Vietnamese)
export const CATEGORY_LABELS = {
    [TRANSACTION_CATEGORIES.RECHARGE]: 'Nạp xu',
    [TRANSACTION_CATEGORIES.JOB_VIEW]: 'Xem số lượng ứng viên',
    [TRANSACTION_CATEGORIES.CV_UNLOCK]: 'Mở khóa hồ sơ ứng viên',
    [TRANSACTION_CATEGORIES.PROFILE_BOOST]: 'Nâng cấp hồ sơ',
    [TRANSACTION_CATEGORIES.JOB_POST]: 'Đăng tin tuyển dụng',
    [TRANSACTION_CATEGORIES.PREMIUM_FEATURE]: 'Tính năng cao cấp'
};

// Role-based category descriptions
export const CANDIDATE_CATEGORIES = [
    TRANSACTION_CATEGORIES.RECHARGE,
    TRANSACTION_CATEGORIES.PROFILE_BOOST,
    TRANSACTION_CATEGORIES.PREMIUM_FEATURE
];

export const RECRUITER_CATEGORIES = [
    TRANSACTION_CATEGORIES.RECHARGE,
    TRANSACTION_CATEGORIES.JOB_VIEW,
    TRANSACTION_CATEGORIES.CV_UNLOCK,
    TRANSACTION_CATEGORIES.JOB_POST,
    TRANSACTION_CATEGORIES.PREMIUM_FEATURE
];

// Transaction type display names (Vietnamese)
export const TRANSACTION_TYPE_LABELS = {
    [TRANSACTION_TYPES.DEPOSIT]: 'Nạp xu',
    [TRANSACTION_TYPES.USAGE]: 'Sử dụng xu'
};
