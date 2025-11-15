import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "@/components/ui/sonner";
import { fetchUser } from './redux/authSlice';
import useFirebaseMessaging from './hooks/useFirebaseMessaging';

function App() {
  const dispatch = useDispatch();
  useFirebaseMessaging(); // ✨ Khởi tạo Firebase messaging

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <AppRouter />
        <Toaster position="top-right" richColors />
      </div>
    </BrowserRouter>
  );
}

export default App;