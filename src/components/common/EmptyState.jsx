import React from 'react';
import { Briefcase } from 'lucide-react'; // Example icon

const EmptyState = ({ message, icon }) => {
  const Icon = icon || Briefcase;
  return (
    <div className="text-center py-10">
      <Icon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-4 text-lg text-gray-500">{message}</p>
    </div>
  );
};

export default EmptyState;
