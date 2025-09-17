import { lazy, Suspense } from 'react';
import Header from '@/components/home/Header';
import HeroSection from '@/components/home/HeroSection';
import LazySection from '@/components/ui/LazySection';
import { useEffect } from 'react';

// Lazy load non-critical sections
const FeaturesSection = lazy(() => import('@/components/home/FeaturesSection'));
const SocialProofSection = lazy(() => import('@/components/home/SocialProofSection'));
const ContactSection = lazy(() => import('@/components/home/ContactSection'));
const Footer = lazy(() => import('@/components/home/Footer'));

// Loading fallback component
const SectionSkeleton = ({ height = 'h-96' }) => (
  <div className={`${height} bg-gray-50 animate-pulse flex items-center justify-center`}>
    <div className="text-gray-400">Đang tải...</div>
  </div>
);

const Homepage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-emerald-50 to-white">
      <Header />
      
      <main id="main-content" tabIndex="-1" className="focus:outline-none">
        <HeroSection />
        
        <LazySection 
          fallback={<SectionSkeleton height="h-[600px]" />}
          rootMargin="200px"
        >
          <Suspense fallback={<SectionSkeleton height="h-[600px]" />}>
            <FeaturesSection />
          </Suspense>
        </LazySection>

        <LazySection 
          fallback={<SectionSkeleton height="h-[800px]" />}
          rootMargin="200px"
        >
          <Suspense fallback={<SectionSkeleton height="h-[800px]" />}>
            <SocialProofSection />
          </Suspense>
        </LazySection>

        <LazySection 
          fallback={<SectionSkeleton height="h-[700px]" />}
          rootMargin="200px"
        >
          <Suspense fallback={<SectionSkeleton height="h-[700px]" />}>
            <ContactSection />
          </Suspense>
        </LazySection>
      </main>

      <LazySection 
        fallback={<SectionSkeleton height="h-64" />}
        rootMargin="100px"
      >
        <Suspense fallback={<SectionSkeleton height="h-64" />}>
          <Footer />
        </Suspense>
      </LazySection>
    </div>
  );
};

export default Homepage;