import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as testService from '@/services/testService';

const createEmptyQuestion = () => ({
  type: 'MULTIPLE_CHOICE',
  question: '',
  score: 1,
  options: [
    { text: 'Đáp án A', isCorrect: true },
    { text: 'Đáp án B', isCorrect: false },
  ],
});

const TestEditor = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!testId;

  const [form, setForm] = useState({
    name: '',
    description: '',
    duration: 30,
    passingScore: 70,
    questions: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    testService.getTestById(testId)
      .then((res) => {
        const t = res.data;
        setForm({
          name: t.name,
          description: t.description,
          duration: t.duration,
          passingScore: t.passingScore,
          questions: t.questions || [],
        });
      })
      .catch(() => toast.error('Không thể tải test'));
  }, [isEdit, testId]);

  const totalScore = useMemo(
    () => form.questions.reduce((sum, q) => sum + Number(q.score || 0), 0),
    [form.questions]
  );

  const updateQuestion = (index, patch) => {
    setForm((prev) => {
      const next = [...prev.questions];
      next[index] = { ...next[index], ...patch };
      return { ...prev, questions: next };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({ ...prev, questions: [...prev.questions, createEmptyQuestion()] }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
  };

  const moveQuestion = (from, to) => {
    setForm((prev) => {
      const next = [...prev.questions];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...prev, questions: next };
    });
  };

  const validate = () => {
    if (!form.name.trim()) return 'Tên test là bắt buộc';
    if (!form.questions.length) return 'Phải có ít nhất 1 câu hỏi';

    for (const q of form.questions) {
      if (!q.question?.trim()) return 'Mỗi câu hỏi phải có nội dung';
      if (!q.options || q.options.length < 2) return 'Câu hỏi trắc nghiệm cần ít nhất 2 đáp án';
      if (!q.options.some((o) => o.isCorrect)) return 'Cần chọn đáp án đúng cho câu trắc nghiệm';
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await testService.updateTest(testId, form);
        toast.success('Cập nhật test thành công');
      } else {
        await testService.createTest(form);
        toast.success('Tạo test thành công');
      }
      navigate('/tests');
    } catch {
      toast.error('Không thể lưu test');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 bg-white border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Thông tin test</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Tên test</label>
          <input className="w-full border rounded px-2 py-1" placeholder="Nhập tên test" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <textarea className="w-full border rounded px-2 py-1" placeholder="Nhập mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thời lượng (phút)</label>
          <input type="number" className="w-full border rounded px-2 py-1" min="1" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Điểm đạt</label>
          <input type="number" className="w-full border rounded px-2 py-1" min="0" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })} />
        </div>
        <p className="text-sm text-slate-600">Tổng điểm: {totalScore}</p>

        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded" onClick={() => addQuestion()}>+ Thêm câu hỏi</button>
        </div>

        <button className="w-full px-3 py-2 border rounded bg-slate-900 text-white" disabled={saving} onClick={handleSubmit}>
          {saving ? 'Đang lưu...' : 'Lưu test'}
        </button>
      </div>

      <div className="lg:col-span-2 bg-white border rounded-lg p-4 space-y-4">
        <h2 className="font-semibold">Danh sách câu hỏi</h2>
        {form.questions.map((q, idx) => (
          <div key={idx} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">Câu {idx + 1} - {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : q.type}</p>
              <div className="flex gap-1">
                <button className="px-2 py-1 border rounded text-xs" disabled={idx === 0} onClick={() => moveQuestion(idx, idx - 1)}>↑</button>
                <button className="px-2 py-1 border rounded text-xs" disabled={idx === form.questions.length - 1} onClick={() => moveQuestion(idx, idx + 1)}>↓</button>
                <button className="px-2 py-1 border rounded text-xs text-red-600" onClick={() => removeQuestion(idx)}>Xóa</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nội dung câu hỏi</label>
              <input className="w-full border rounded px-2 py-1" value={q.question} onChange={(e) => updateQuestion(idx, { question: e.target.value })} placeholder="Nhập nội dung câu hỏi" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Điểm</label>
              <input type="number" className="w-32 border rounded px-2 py-1" min="1" value={q.score} onChange={(e) => updateQuestion(idx, { score: Number(e.target.value) })} />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Đáp án (chọn đáp án đúng)</label>
              {(q.options || []).map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={opt.isCorrect}
                    onChange={() => {
                      const nextOpts = (q.options || []).map((o, i) => ({ ...o, isCorrect: i === optIdx }));
                      updateQuestion(idx, { options: nextOpts });
                    }}
                  />
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    value={opt.text}
                    placeholder="Nhập nội dung đáp án"
                    onChange={(e) => {
                      const nextOpts = [...(q.options || [])];
                      nextOpts[optIdx] = { ...nextOpts[optIdx], text: e.target.value };
                      updateQuestion(idx, { options: nextOpts });
                    }}
                  />
                </div>
              ))}
              <button
                className="px-2 py-1 border rounded text-xs"
                onClick={() => updateQuestion(idx, { options: [...(q.options || []), { text: '', isCorrect: false }] })}
              >
                + Thêm đáp án
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestEditor;
