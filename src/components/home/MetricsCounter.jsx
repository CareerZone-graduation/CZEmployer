import { useState, useEffect } from 'react';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

const counterVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.1 * i,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Custom hook for animated counter
const useAnimatedCounter = (endValue, duration = 2000, shouldAnimate = true) => {
  const [count, setCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!shouldAnimate || prefersReducedMotion) {
      setCount(endValue);
      return;
    }

    let startTime;
    const startValue = 0;
    const numericEndValue = parseInt(endValue.replace(/[^0-9]/g, ''));

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (numericEndValue - startValue) * easeOutQuart);
      
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(numericEndValue);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, duration, shouldAnimate, prefersReducedMotion]);

  return count;
};

const MetricsCounter = ({ 
  icon: Icon, 
  value, 
  suffix = '', 
  label, 
  index = 0,
  className 
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: '0px'
  });
  
  const [hasAnimated, setHasAnimated] = useState(false);
  const animatedValue = useAnimatedCounter(value, 2000, isIntersecting && !hasAnimated);

  useEffect(() => {
    if (isIntersecting && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isIntersecting, hasAnimated]);

  return (
    <MotionWrapper
      ref={ref}
      variants={counterVariants}
      custom={index}
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className={cn("text-center", className)}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>

        {/* Counter */}
        <div>
          <div 
            className="text-3xl md:text-4xl font-bold text-gray-900"
            aria-label={`${value}${suffix} ${label}`}
          >
            {animatedValue.toLocaleString()}{suffix}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {label}
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
};

export default MetricsCounter;