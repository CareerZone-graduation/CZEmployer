import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CVViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cvUrl = location.state?.cvUrl;

  if (!cvUrl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Không tìm thấy đường dẫn CV.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background">
      <header className="p-4 border-b bg-card flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-semibold">Trình xem CV</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
      </header>
      <div className="flex-grow">
        <iframe
          src={cvUrl}
          title="CV Viewer"
          className="w-full h-full"
          frameBorder="0"
        />
      </div>
    </div>
  );
};

export default CVViewer;