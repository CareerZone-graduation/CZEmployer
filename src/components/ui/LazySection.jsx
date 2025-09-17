import { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

/**
 * Lazy loading section component for non-critical content
 */
const LazySection = ({ 
  children, 
  fallback = null, 
  threshold = 0.1, 
  rootMargin = '100px',
  className,
  ...props 
}) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin
  });

  // Load content when it comes into view
  if (isIntersecting && !hasLoaded) {
    setHasLoaded(true);
  }

  return (
    <div ref={ref} className={className} {...props}>
      {hasLoaded ? children : fallback}
    </div>
  );
};

export default LazySection;