import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import * as testService from '@/services/testService';

const TestPreview = () => {
  const { testId } = useParams();
  const [test, setTest] = useState(null);

  useEffect(() => {
    testService.getTestById(testId)
      .then((res) => setTest(res.data))
      .catch(() => toast.error('Không thể tải preview test'));
  }, [testId]);

  if (!test) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Preview: {test.name}</h1>
      <p className="text-sm text-slate-600">{test.description}</p>
      <div className="text-sm">Thời gian: {test.duration} phút | Điểm qua: {test.passingScore} | Tổng điểm: {test.totalScore}</div>

      <div className="space-y-3">
        {(test.questions || []).map((q, idx) => (
          <div key={q._id || idx} className="bg-white border rounded-lg p-3">
            <p className="font-medium">Câu {idx + 1}: {q.question}</p>
            <p className="text-xs text-slate-500">Loại: {q.type} | Điểm: {q.score}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {(q.options || []).map((o, i) => (
                <li key={i} className={o.isCorrect ? 'text-emerald-600' : ''}>- {o.text}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPreview;
