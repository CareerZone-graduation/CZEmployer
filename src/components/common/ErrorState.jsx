import React from 'react';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

const ErrorState = ({ onRetry, message = 'Có lỗi xảy ra. Vui lòng thử lại.' }) => {
  return (
    <div className="text-center py-10">
      <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
      <p className="mt-4 text-lg text-red-600">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-4">
          Thử lại
        </Button>
      )}
    </div>
  );
};

export default ErrorState;