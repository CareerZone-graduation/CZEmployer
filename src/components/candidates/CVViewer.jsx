import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import * as candidateService from '@/services/candidateService';

const CVViewer = ({ isOpen, onClose, userId, cv, isLocked }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  const loadPdf = async () => {
    if (pdfUrl) return; // Already loaded

    setIsLoading(true);
    try {
      const response = await candidateService.getCandidateCv(userId, cv._id);
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Error loading CV:', err);
      toast.error('Không thể tải CV. Vui lòng thử lại.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = cv.name || 'CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải xuống CV');
  };

  const handleClose = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    onClose();
  };

  // Load PDF when dialog opens
  if (isOpen && !pdfUrl && !isLoading) {
    loadPdf();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              {cv.name}
              {isLocked && (
                <span className="text-xs font-normal text-muted-foreground bg-amber-100 px-2 py-1 rounded">
                  Đã che thông tin
                </span>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!pdfUrl}
              >
                <Download className="h-4 w-4 mr-2" />
                Tải xuống
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-gray-50 p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải CV...</p>
              </div>
            </div>
          )}

          {pdfUrl && (
            <div className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden">
              <iframe
                src={`${pdfUrl}#view=FitH`}
                className="w-full h-full"
                title={cv.name}
                style={{ border: 'none' }}
              />
            </div>
          )}
        </div>

        {isLocked && (
          <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <svg className="h-4 w-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  CV đã được bảo mật
                </p>
                <p className="text-xs text-amber-800">
                  Email và số điện thoại trong CV đã được che bằng hình chữ nhật xám. 
                  Mở khóa hồ sơ (50 coins) để xem thông tin liên hệ đầy đủ.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CVViewer;
