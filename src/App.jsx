import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { fetchUser } from './redux/authSlice';
import { CopilotProvider } from '@/contexts/CopilotContext';
import CopilotPanel from '@/components/copilot/CopilotPanel';
import useFirebaseMessaging from './hooks/useFirebaseMessaging';
import AppRouter from './routes/AppRouter';

function App() {
  const dispatch = useDispatch();
  useFirebaseMessaging(); // ✨ Khởi tạo Firebase messaging

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <CopilotProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRouter />
          <Toaster position="top-right" richColors />
          <CopilotPanel />
        </div>
      </CopilotProvider>
    </BrowserRouter>
  );
}

export default App;