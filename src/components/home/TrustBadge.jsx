import MotionWrapper from '@/components/ui/MotionWrapper';
import { cn } from '@/lib/utils';

const badgeVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const variantStyles = {
  security: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    description: 'text-blue-700'
  },
  compliance: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    description: 'text-green-700'
  },
  certification: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600',
    title: 'text-yellow-900',
    description: 'text-yellow-700'
  }
};

const TrustBadge = ({ 
  icon: Icon, 
  title, 
  description, 
  variant = 'security', 
  index = 0,
  className 
}) => {
  const styles = variantStyles[variant] || variantStyles.security;

  return (
    <MotionWrapper
      variants={badgeVariants}
      custom={index}
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "p-6 rounded-xl border transition-all duration-300 hover:shadow-md",
        styles.bg,
        styles.border,
        className
      )}
    >
      <div className="flex flex-col items-center text-center gap-3">
        {/* Icon */}
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg",
          styles.icon
        )}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>

        {/* Content */}
        <div>
          <h4 className={cn("font-semibold mb-1", styles.title)}>
            {title}
          </h4>
          <p className={cn("text-sm", styles.description)}>
            {description}
          </p>
        </div>
      </div>
    </MotionWrapper>
  );
};

export default TrustBadge;