export const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  // Convert string to number if it's a string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Check if it's a valid number after conversion
  if (isNaN(numValue)) {
    return value;
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numValue);
};
