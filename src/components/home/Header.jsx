import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Briefcase } from 'lucide-react';
import { VIETNAMESE_CONTENT } from '@/constants/vietnamese';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: VIETNAMESE_CONTENT.navigation.features, href: '#features' },
    { name: VIETNAMESE_CONTENT.navigation.customers, href: '#testimonials' },
    { name: VIETNAMESE_CONTENT.navigation.contact, href: '#contact' }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="group flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition-transform group-hover:scale-105">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              Career<span className="text-emerald-600">Zone</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors duration-200 relative group"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="/auth/login" className="font-medium text-gray-700 hover:text-emerald-600">
                {VIETNAMESE_CONTENT.navigation.login}
              </a>
            </Button>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300">
              <a href="/auth/register">
                {VIETNAMESE_CONTENT.navigation.tryFree}
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="flex items-center gap-2 pb-6 border-b border-gray-200">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-gray-900">
                    Career<span className="text-emerald-600">Zone</span>
                  </span>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-4 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-base font-medium text-gray-600 hover:text-emerald-600 transition-colors duration-200 py-2"
                    >
                      {item.name}
                    </a>
                  ))}
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="mt-auto space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/auth/login" onClick={() => setIsOpen(false)}>
                      {VIETNAMESE_CONTENT.navigation.login}
                    </a>
                  </Button>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700" asChild>
                    <a href="/auth/register" onClick={() => setIsOpen(false)}>
                      {VIETNAMESE_CONTENT.navigation.tryFree}
                    </a>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;