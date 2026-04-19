import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as workflowService from '@/services/workflowService';
import * as jobService from '@/services/jobService';

const WorkflowList = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign modal state
  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchWorkflows = async () => {
    try {
      const res = await workflowService.getWorkflows({ page: 1, limit: 100 });
      setWorkflows(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách workflow');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkflows(); }, []);

  const createBlank = async () => {
    try {
      const res = await workflowService.createWorkflow({ name: 'Workflow mới', description: '' });
      navigate(`/workflows/${res.data?._id}/builder`);
    } catch {
      toast.error('Không thể tạo workflow');
    }
  };

  const handleDelete = async (workflowId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa quy trình này không?')) return;
    try {
      await workflowService.deleteWorkflow(workflowId);
      toast.success('Xóa quy trình thành công');
      fetchWorkflows();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa quy trình');
    }
  };

  const openAssignModal = async (workflow) => {
    setSelectedWorkflow(workflow);
    setAssignModalOpen(true);
    setSelectedJobId('');
    try {
      const res = await jobService.getMyJobs({ limit: 100, status: 'ACTIVE,PENDING,INACTIVE' });
      setJobs(res.data || []);
    } catch {
      toast.error('Lỗi khi tải danh sách tin tuyển dụng');
    }
  };

  const handleToggleStatus = async (workflow) => {
    const newStatus = workflow.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await workflowService.updateWorkflow(workflow._id, { status: newStatus });
      toast.success(`Đã chuyển sang trạng thái ${newStatus}`);
      fetchWorkflows();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleAssign = async () => {
    if (!selectedJobId) {
      toast.error('Vui lòng chọn một tin tuyển dụng');
      return;
    }
    setAssigning(true);
    try {
      await jobService.updateJob(selectedJobId, { workflowId: selectedWorkflow._id });
      toast.success('Gán quy trình vào tin tuyển dụng thành công');
      setAssignModalOpen(false);
    } catch {
      toast.error('Có lỗi xảy ra khi gán quy trình');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Workflow Management</h1>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded" onClick={() => navigate('/workflows/templates')}>Templates</button>
          <button className="px-3 py-2 border rounded bg-slate-900 text-white" onClick={createBlank}>Tạo workflow</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Tên</th>
              <th className="text-left p-3 w-48">Trạng thái</th>
              <th className="text-left p-3">Jobs áp dụng</th>
              <th className="text-left p-3">Cập nhật</th>
              <th className="text-right p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((w) => (
              <tr key={w._id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{w.name}</div>
                  {w.description && <div className="text-xs text-slate-500 mt-1">{w.description}</div>}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleToggleStatus(w)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      w.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        w.status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="ml-2 text-xs font-medium text-slate-600">
                    {w.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="p-3 text-sm text-slate-600">
                  {w.attachedJobTitles && w.attachedJobTitles.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {w.attachedJobTitles.map((title, idx) => (
                        <li key={idx} className="truncate max-w-[200px]" title={title}>{title}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400 italic">Chưa áp dụng</span>
                  )}
                </td>
                <td className="p-3">{new Date(w.updatedAt).toLocaleString('vi-VN')}</td>
                <td className="p-3 text-right space-x-2">
                  <button className="px-2 py-1 border rounded hover:bg-slate-50" onClick={() => navigate(`/workflows/${w._id}/builder`)}>Chỉnh sửa</button>
                  <button className="px-2 py-1 border rounded text-blue-600 hover:bg-blue-50" onClick={() => openAssignModal(w)}>Gán vào Job</button>
                  <button className="px-2 py-1 border border-red-200 rounded text-red-600 hover:bg-red-50" onClick={() => handleDelete(w._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Gán Workflow vào Job</h2>
            <p className="text-sm text-slate-600 mb-4">
              Chọn một tin tuyển dụng để áp dụng quy trình <strong>{selectedWorkflow?.name}</strong>.
            </p>
            <div className="mb-4">
              <select
                className="w-full border rounded p-2 text-sm"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
              >
                <option value="">-- Chọn tin tuyển dụng --</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} ({job.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 border rounded text-sm hover:bg-slate-50" 
                onClick={() => setAssignModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-slate-900 text-white rounded text-sm disabled:opacity-50" 
                onClick={handleAssign}
                disabled={assigning || !selectedJobId}
              >
                {assigning ? 'Đang lưu...' : 'Xác nhận gán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowList;
