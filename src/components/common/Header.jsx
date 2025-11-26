import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { handleArrowKeyNavigation, getFocusableElements } from '@/utils/accessibility';

const Header = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const navRef = useRef(null);

  const navigationItems = [
    { href: '#features', label: 'Tính năng' },
    { href: '#solutions', label: 'Giải pháp' },
    { href: '#pricing', label: 'Giá cả' },
    { href: 'support', label: 'Liên hệ' },
  ];

  const closeSheet = () => setIsOpen(false);

  // Handle keyboard navigation in desktop menu
  const handleKeyDown = (e) => {
    if (!navRef.current) return;
    
    const focusableElements = getFocusableElements(navRef.current);
    const newIndex = handleArrowKeyNavigation(e, focusableElements, currentFocusIndex);
    
    if (newIndex !== currentFocusIndex) {
      setCurrentFocusIndex(newIndex);
    }
  };

  // Handle smooth scrolling for anchor links
  const handleAnchorClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        // Focus the target for accessibility
        target.focus();
      }
      closeSheet();
    }
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeSheet();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60",
      className
    )}>
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="CareerZone - Trang chủ"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Career<span className="text-emerald-600">Zone</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav 
          ref={navRef}
          className="hidden md:flex items-center gap-6" 
          role="navigation" 
          aria-label="Điều hướng chính"
          onKeyDown={handleKeyDown}
        >
          {navigationItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href)}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-600 focus:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-sm px-2 py-1"
              onFocus={() => setCurrentFocusIndex(index)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/auth/login">
            <Button 
              variant="ghost" 
              className="font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
            >
              Đăng nhập
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button 
              className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-300"
            >
              Dùng thử miễn phí
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 mt-6">
              {/* Mobile Logo */}
              <Link 
                to="/" 
                className="flex items-center gap-2"
                onClick={closeSheet}
                aria-label="CareerZone - Trang chủ"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                  <Briefcase className="h-4 w-4" />
                </div>
                <span className="text-lg font-bold tracking-tight text-gray-900">
                  Career<span className="text-emerald-600">Zone</span>
                </span>
              </Link>

              {/* Mobile Navigation */}
              <nav className="flex flex-col gap-4" role="navigation" aria-label="Điều hướng di động">
                {navigationItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleAnchorClick(e, item.href)}
                    className="text-base font-medium text-gray-600 transition-colors hover:text-emerald-600 focus:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-sm px-2 py-2"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <Link to="/auth/login" onClick={closeSheet}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center font-medium border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/auth/register" onClick={closeSheet}>
                  <Button 
                    className="w-full justify-center bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Dùng thử miễn phí
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;