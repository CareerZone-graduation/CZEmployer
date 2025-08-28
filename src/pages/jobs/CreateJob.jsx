import JobForm from '@/components/jobs/JobForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const CreateJob = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/jobs');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Tạo Tin Tuyển Dụng Mới</CardTitle>
      </CardHeader>
      <CardContent>
        <JobForm onSuccess={handleSuccess} />
      </CardContent>
    </Card>
  );
};

export default CreateJob;
