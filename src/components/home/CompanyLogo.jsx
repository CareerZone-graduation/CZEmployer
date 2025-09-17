import MotionWrapper from '@/components/ui/MotionWrapper';
import LazyImage from '@/components/ui/LazyImage';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const logoVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * i,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const CompanyLogo = ({ name, logo, index = 0, className }) => {
  return (
    <MotionWrapper
      variants={logoVariants}
      custom={index}
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "flex items-center justify-center p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-300 group",
        className
      )}
    >
      {logo ? (
        <LazyImage
          src={logo}
          alt={`Logo của ${name}`}
          className="h-8 w-auto max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
        />
      ) : (
        <div className="flex items-center gap-2 text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
          <Building2 className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm font-medium truncate">{name}</span>
        </div>
      )}
    </MotionWrapper>
  );
};

export default CompanyLogo;