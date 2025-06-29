import React from 'react';

const JobForm = ({ onClose, job }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{job ? 'Edit Job' : 'Create New Job'}</h2>
      <p>Job form fields will go here.</p>
      <button onClick={onClose} className="mt-4 p-2 bg-gray-200 rounded">Close</button>
    </div>
  );
};

export default JobForm;