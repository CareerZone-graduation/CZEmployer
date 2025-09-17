import { cn } from '@/lib/utils';
import { VIETNAMESE_TYPOGRAPHY } from '@/constants/vietnamese';

/**
 * Vietnamese Text Component with proper typography and formatting
 * Handles Vietnamese-specific text formatting, spacing, and cultural context
 */
const VietnameseText = ({ 
  children, 
  className, 
  variant = 'body',
  as: Component = 'p',
  formatCurrency,
  formatPhone,
  formatDate,
  formatNumber,
  ...props 
}) => {
  let content = children;

  // Apply Vietnamese formatting if specified
  if (formatCurrency && typeof children === 'number') {
    content = VIETNAMESE_TYPOGRAPHY.formatCurrency(children);
  } else if (formatPhone && typeof children === 'string') {
    content = VIETNAMESE_TYPOGRAPHY.formatPhone(children);
  } else if (formatDate && children instanceof Date) {
    content = VIETNAMESE_TYPOGRAPHY.formatDate(children);
  } else if (formatNumber && typeof children === 'number') {
    content = VIETNAMESE_TYPOGRAPHY.formatNumber(children);
  }

  // Vietnamese typography variants
  const variants = {
    heading: 'font-bold leading-tight tracking-tight',
    subheading: 'font-semibold leading-snug',
    body: 'leading-relaxed',
    caption: 'text-sm leading-normal',
    label: 'font-medium leading-normal',
    professional: 'font-medium leading-relaxed tracking-wide'
  };

  const baseClasses = cn(
    'text-gray-900',
    variants[variant],
    className
  );

  return (
    <Component className={baseClasses} {...props}>
      {content}
    </Component>
  );
};

/**
 * Professional Vietnamese heading component
 */
export const VietnameseHeading = ({ children, level = 1, className, ...props }) => {
  const Component = `h${level}`;
  const levelClasses = {
    1: 'text-4xl md:text-5xl lg:text-6xl font-extrabold',
    2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
    3: 'text-2xl md:text-3xl font-bold',
    4: 'text-xl md:text-2xl font-semibold',
    5: 'text-lg md:text-xl font-semibold',
    6: 'text-base md:text-lg font-semibold'
  };

  return (
    <VietnameseText
      as={Component}
      variant="heading"
      className={cn(levelClasses[level], className)}
      {...props}
    >
      {children}
    </VietnameseText>
  );
};

/**
 * Professional Vietnamese paragraph component
 */
export const VietnameseParagraph = ({ children, size = 'base', className, ...props }) => {
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl'
  };

  return (
    <VietnameseText
      variant="body"
      className={cn(sizeClasses[size], 'text-gray-600', className)}
      {...props}
    >
      {children}
    </VietnameseText>
  );
};

/**
 * Professional Vietnamese label component for forms
 */
export const VietnameseLabel = ({ children, required, className, ...props }) => {
  return (
    <VietnameseText
      as="label"
      variant="label"
      className={cn('text-sm text-gray-700', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </VietnameseText>
  );
};

/**
 * Vietnamese currency formatter component
 */
export const VietnameseCurrency = ({ amount, className, ...props }) => {
  return (
    <VietnameseText
      variant="professional"
      className={cn('font-semibold text-emerald-600', className)}
      formatCurrency
      {...props}
    >
      {amount}
    </VietnameseText>
  );
};

/**
 * Vietnamese phone number formatter component
 */
export const VietnamesePhone = ({ phone, className, ...props }) => {
  return (
    <VietnameseText
      variant="body"
      className={cn('font-mono', className)}
      formatPhone
      {...props}
    >
      {phone}
    </VietnameseText>
  );
};

/**
 * Vietnamese date formatter component
 */
export const VietnameseDate = ({ date, className, showTime = false, ...props }) => {
  const formatDate = (date) => {
    const dateStr = VIETNAMESE_TYPOGRAPHY.formatDate(date);
    if (showTime) {
      const timeStr = VIETNAMESE_TYPOGRAPHY.formatTime(date);
      return `${dateStr} lúc ${timeStr}`;
    }
    return dateStr;
  };

  return (
    <VietnameseText
      variant="body"
      className={className}
      {...props}
    >
      {formatDate(date)}
    </VietnameseText>
  );
};

export default VietnameseText;