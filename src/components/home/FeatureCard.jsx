import { motion } from 'framer-motion';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { cn } from '@/lib/utils';

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.95 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.1 * i,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.1, 
    rotate: 5,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const FeatureCard = ({ icon: Icon, title, description, index = 0, className }) => {
  return (
    <MotionWrapper
      variants={cardVariants}
      custom={index}
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      initial="rest"
      whileHover="hover"
      className={cn(
        "group relative bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden",
        className
      )}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Icon container with enhanced styling */}
      <motion.div 
        variants={iconVariants}
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 mb-6 group-hover:bg-gradient-to-br group-hover:from-emerald-600 group-hover:to-emerald-500 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-lg"
      >
        <Icon className="h-8 w-8" aria-hidden="true" strokeWidth={1.5} />
        
        {/* Icon background glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>

      {/* Content with improved typography */}
      <div className="relative space-y-4">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-300 leading-tight">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed text-base group-hover:text-gray-700 transition-colors duration-300">
          {description}
        </p>
      </div>

      {/* Enhanced border glow effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-emerald-200/0 group-hover:border-emerald-200/50 transition-all duration-500" />
      
      {/* Subtle shine effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </MotionWrapper>
  );
};

export default FeatureCard;