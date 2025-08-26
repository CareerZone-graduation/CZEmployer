import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import CompanyRegisterForm from '../../components/company/CompanyRegisterForm';

const TestCompanyForm = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Test Company Registration Form</CardTitle>
          <CardDescription>
            Form đăng ký công ty với cấu trúc location mới (province/ward)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyRegisterForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default TestCompanyForm;
