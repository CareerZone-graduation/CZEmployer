import { useEffect, useRef } from 'react';

/**
 * Hook for managing focus for accessibility
 * @param {boolean} shouldFocus - Whether to focus the element
 * @param {Object} options - Focus options
 * @returns {Object} ref to attach to element
 */
export const useFocusManagement = (shouldFocus = false, options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      // Small delay to ensure element is rendered
      const timeoutId = setTimeout(() => {
        ref.current.focus(options);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldFocus, options]);

  return ref;
};

/**
 * Hook for trapping focus within a container (useful for modals)
 * @param {boolean} isActive - Whether focus trap is active
 * @returns {Object} ref to attach to container
 */
export const useFocusTrap = (isActive = false) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const container = ref.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element when trap becomes active
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return ref;
};