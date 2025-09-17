import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Motion wrapper that respects user's reduced motion preference
 */
const MotionWrapper = ({ 
  children, 
  variants, 
  initial = 'hidden',
  animate = 'show',
  whileInView,
  viewport = { once: true, margin: '-100px' },
  transition,
  reducedMotionFallback = {},
  ...props 
}) => {
  const prefersReducedMotion = useReducedMotion();

  // If user prefers reduced motion, use fallback or disable animations
  const motionProps = prefersReducedMotion
    ? {
        initial: false,
        animate: false,
        whileInView: false,
        transition: { duration: 0 },
        ...reducedMotionFallback
      }
    : {
        variants,
        initial,
        animate,
        whileInView,
        viewport,
        transition,
        ...props
      };

  return (
    <motion.div {...motionProps}>
      {children}
    </motion.div>
  );
};

export default MotionWrapper;