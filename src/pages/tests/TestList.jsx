import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as testService from '@/services/testService';

const TestList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);

  const fetchTests = async () => {
    try {
      const res = await testService.getTests({ page: 1, limit: 100 });
      setTests(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách test');
    }
  };

  useEffect(() => { fetchTests(); }, []);

  const handleDelete = async (id) => {
    try {
      await testService.deleteTest(id);
      toast.success('Xóa test thành công');
      fetchTests();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Không thể xóa test');
    }
  };

  const handleDuplicate = async (id) => {
    await testService.duplicateTest(id);
    toast.success('Nhân bản test thành công');
    fetchTests();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Test Management</h1>
        <button className="px-3 py-2 border rounded bg-slate-900 text-white" onClick={() => navigate('/tests/new')}>Tạo test</button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Tên</th>
              <th className="text-left p-3">Câu hỏi</th>
              <th className="text-left p-3">Thời gian</th>
              <th className="text-left p-3">Số lần dùng</th>
              <th className="text-right p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t._id} className="border-t">
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.questions?.length || 0}</td>
                <td className="p-3">{t.duration} phút</td>
                <td className="p-3">{t.usageCount}</td>
                <td className="p-3 text-right space-x-2">
                  <button className="px-2 py-1 border rounded" onClick={() => navigate(`/tests/${t._id}/preview`)}>Preview</button>
                  <button className="px-2 py-1 border rounded" onClick={() => navigate(`/tests/${t._id}/edit`)}>Sửa</button>
                  <button className="px-2 py-1 border rounded" onClick={() => handleDuplicate(t._id)}>Nhân bản</button>
                  <button className="px-2 py-1 border rounded text-red-600" onClick={() => handleDelete(t._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestList;
