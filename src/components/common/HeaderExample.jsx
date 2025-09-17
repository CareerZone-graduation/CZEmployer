import React from 'react';
import Header from './Header';

// Simple example component to demonstrate Header usage
const HeaderExample = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header Component */}
      <Header />
      
      {/* Example content to show header in context */}
      <main className="container mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Header Component Example
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This demonstrates the new professional Header component with responsive navigation.
          </p>
          
          {/* Anchor sections for navigation testing */}
          <div className="space-y-16 mt-16">
            <section id="features" className="py-16 bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tính năng</h2>
              <p className="text-gray-600">Features section content goes here.</p>
            </section>
            
            <section id="solutions" className="py-16 bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Giải pháp</h2>
              <p className="text-gray-600">Solutions section content goes here.</p>
            </section>
            
            <section id="pricing" className="py-16 bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Giá cả</h2>
              <p className="text-gray-600">Pricing section content goes here.</p>
            </section>
            
            <section id="contact" className="py-16 bg-white rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Liên hệ</h2>
              <p className="text-gray-600">Contact section content goes here.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeaderExample;