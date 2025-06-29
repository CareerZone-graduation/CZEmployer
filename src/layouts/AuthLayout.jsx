import { Outlet } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center items-center gap-2 mb-6">
          <Briefcase className="h-8 w-8 text-emerald-700" />
          <h1 className="text-3xl font-bold text-emerald-700">CareerZone</h1>
        </div>
        <Card className="shadow-xl rounded-lg">
          <CardContent className="p-8">
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
