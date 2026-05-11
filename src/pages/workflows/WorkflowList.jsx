import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as workflowService from '@/services/workflowService';
import * as jobService from '@/services/jobService';

const WorkflowList = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  // Assign modal state
  const [isConfigJobsModalOpen, setConfigJobsModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await workflowService.getWorkflows({ page: 1, limit: 100, archived: showArchived ? 'true' : 'false' });
      setWorkflows(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách workflow');
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  const createBlank = async () => {
    const rawName = window.prompt('Nhập tên workflow mới', 'Workflow mới');
    if (rawName === null) return;

    const workflowName = rawName.trim();
    if (!workflowName) {
      toast.error('Tên workflow không được để trống');
      return;
    }
    if (workflowName.length > 200) {
      toast.error('Tên workflow không được vượt quá 200 ký tự');
      return;
    }

    try {
      const res = await workflowService.createWorkflow({ name: workflowName, description: '' });
      navigate(`/workflows/${res.data?._id}/builder`);
    } catch {
      toast.error('Không thể tạo workflow');
    }
  };

  const handleArchive = async (workflowId, hasLinkedJob) => {
    const confirmMessage = hasLinkedJob
      ? 'Workflow đã có job liên kết. Bạn có chắc chắn muốn archive workflow này không?'
      : 'Workflow chưa có job liên kết. Bạn có chắc chắn muốn xóa vĩnh viễn workflow này không?';

    if (!window.confirm(confirmMessage)) return;

    try {
      const res = await workflowService.deleteWorkflow(workflowId);
      toast.success(res.message || 'Thao tác thành công');
      fetchWorkflows();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể thực hiện thao tác này');
    }
  };

  const handleUnarchive = async (workflowId) => {
    try {
      await workflowService.unarchiveWorkflow(workflowId);
      toast.success('Khôi phục workflow thành công');
      fetchWorkflows();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể khôi phục workflow');
    }
  };

  const handleClone = async (workflow) => {
    try {
      const res = await workflowService.cloneWorkflow(workflow._id, {});
      toast.success('Nhân bản workflow thành công');
      navigate(`/workflows/${res.data?._id}/builder`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể nhân bản workflow');
    }
  };

  const openConfigJobsModal = async (workflow) => {
    if (workflow.attachedJobs && workflow.attachedJobs.length > 0) {
      toast.error('Workflow đã được gán cố định cho job. Vui lòng nhân bản workflow để gán cho job khác.');
      return;
    }

    setSelectedWorkflow(workflow);
    setConfigJobsModalOpen(true);
    setSelectedJobId(null);
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

  const handleSaveJobs = async () => {
    if (!selectedJobId) {
      toast.error('Vui lòng chọn một job để gán workflow');
      return;
    }

    setAssigning(true);
    try {
      await jobService.updateJob(selectedJobId, { workflowId: selectedWorkflow._id });

      toast.success('Gán workflow vào job thành công');
      setConfigJobsModalOpen(false);
      fetchWorkflows();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gán quy trình');
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
          <button className="px-3 py-2 border rounded" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? 'Đang xem Archived' : 'Xem Archived'}
          </button>
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
                    disabled={showArchived}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      w.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'
                    } ${showArchived ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  {w.attachedJobs && w.attachedJobs.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {w.attachedJobs.map((job) => (
                        <div key={job._id} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-1 text-xs">
                          <span className="truncate max-w-[150px]" title={job.title}>{job.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : w.attachedJobTitles && w.attachedJobTitles.length > 0 ? (
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
                  {!showArchived ? (
                    <>
                      <button className="px-2 py-1 border rounded hover:bg-slate-50" onClick={() => navigate(`/workflows/${w._id}/builder`)}>Chỉnh sửa</button>
                      <button className="px-2 py-1 border rounded hover:bg-slate-50" onClick={() => handleClone(w)}>Nhân bản</button>
                      <button
                        className="px-2 py-1 border rounded text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                        onClick={() => openConfigJobsModal(w)}
                        disabled={w.attachedJobs && w.attachedJobs.length > 0}
                      >
                        Gán vào Job
                      </button>
                      <button
                        className={`px-2 py-1 border rounded ${w.attachedJobs && w.attachedJobs.length > 0 ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                        onClick={() => handleArchive(w._id, !!(w.attachedJobs && w.attachedJobs.length > 0))}
                      >
                        {w.attachedJobs && w.attachedJobs.length > 0 ? 'Archive' : 'Xóa vĩnh viễn'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="px-2 py-1 border rounded hover:bg-slate-50" onClick={() => handleClone(w)}>Nhân bản</button>
                      <button className="px-2 py-1 border border-green-200 rounded text-green-700 hover:bg-green-50" onClick={() => handleUnarchive(w._id)}>Unarchive</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Config Jobs Modal */}
      {isConfigJobsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg flex flex-col max-h-[90vh]">
            <h2 className="text-lg font-semibold mb-4">Thiết lập Job áp dụng</h2>
            <p className="text-sm text-slate-600 mb-4">
              Chọn các tin tuyển dụng để áp dụng quy trình <strong>{selectedWorkflow?.name}</strong>.
            </p>
            <div className="flex-1 overflow-y-auto min-h-[150px] mb-4 border rounded p-2 bg-slate-50">
              {jobs.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-4">Không có tin tuyển dụng nào</div>
              ) : (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <label key={job._id} className="flex items-start gap-2 p-2 hover:bg-white rounded cursor-pointer border border-transparent hover:border-slate-200">
                      <input
                        type="radio"
                        name="workflow-job"
                        className="mt-1"
                        checked={selectedJobId === job._id}
                        onChange={() => setSelectedJobId(job._id)}
                      />
                      <div>
                        <div className="font-medium text-sm">{job.title}</div>
                        <div className="text-xs text-slate-500">Trạng thái: {job.status}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button 
                className="px-4 py-2 border rounded text-sm hover:bg-slate-50" 
                onClick={() => setConfigJobsModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-slate-900 text-white rounded text-sm disabled:opacity-50" 
                onClick={handleSaveJobs}
                disabled={assigning}
              >
                {assigning ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowList;
