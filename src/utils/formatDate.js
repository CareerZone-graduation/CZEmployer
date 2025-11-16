export const formatDate = (date) => {
  if (!date) return '-';
  
  const parsedDate = new Date(date);
  
  // Check for invalid date
  if (isNaN(parsedDate.getTime())) {
    return '-';
  }
  
  return parsedDate.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const formatDateTime = (date) => {
  if (!date) return '-';
  
  const parsedDate = new Date(date);
  
  // Check for invalid date
  if (isNaN(parsedDate.getTime())) {
    return '-';
  }
  
  return parsedDate.toLocaleString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const getRelativeTime = (date) => {
  const now = new Date()
  const diffInMs = now - new Date(date)
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    return `${diffInDays} days ago`
  }
}

export const formatDateTimeShort = (date) => {
  if (!date) return '-';
  
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    return '-';
  }
  
  return parsedDate.toLocaleString("vi-VN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
