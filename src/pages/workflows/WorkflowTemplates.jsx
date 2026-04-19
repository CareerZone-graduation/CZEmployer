import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as workflowService from '@/services/workflowService';

const WorkflowTemplates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    workflowService.getWorkflowTemplates()
      .then((res) => setTemplates(res.data?.data || []))
      .catch(() => toast.error('Không thể tải templates'));
  }, []);

  const applyTemplate = async (templateId) => {
    try {
      const res = await workflowService.applyWorkflowTemplate(templateId, {
        name: 'Workflow từ template',
        description: '',
      });
      navigate(`/workflows/${res.data?._id}/builder`);
    } catch {
      toast.error('Không thể áp dụng template');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Workflow Templates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <div key={t._id} className="border bg-white rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">{t.name}</h3>
            <p className="text-sm text-slate-600">{t.description}</p>
            <button className="px-3 py-2 border rounded" onClick={() => applyTemplate(t._id)}>Áp dụng template</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowTemplates;
