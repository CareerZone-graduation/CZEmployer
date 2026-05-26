import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus, Trash2, X, Clock, AlertCircle, Award,
  ChevronLeft, ArrowUp, ArrowDown, HelpCircle, Save, Target, Check
} from 'lucide-react';
import * as testService from '@/services/testService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  const [isAssigned, setIsAssigned] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }
    setLoading(true);
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
        setIsAssigned(!!t.isAssigned);
      })
      .catch((e) => toast.error(e?.response?.data?.message || 'Không thể tải test'))
      .finally(() => setLoading(false));
  }, [isEdit, testId]);

  const totalScore = useMemo(
    () => form.questions.reduce((sum, q) => sum + Number(q.score || 0), 0),
    [form.questions]
  );

  // Tính tỷ lệ phần trăm của điểm đạt trên tổng điểm để hiển thị progress bar
  const passingRatePercentage = useMemo(() => {
    if (!totalScore) return 0;
    return Math.min(100, Math.round((form.passingScore / totalScore) * 100));
  }, [form.passingScore, totalScore]);

  const updateQuestion = (index, patch) => {
    if (isAssigned) return;
    setForm((prev) => {
      const next = [...prev.questions];
      next[index] = { ...next[index], ...patch };
      return { ...prev, questions: next };
    });
  };

  const addQuestion = () => {
    if (isAssigned) {
      toast.warning('Không thể thêm câu hỏi cho bài test đã giao');
      return;
    }
    setForm((prev) => ({ ...prev, questions: [...prev.questions, createEmptyQuestion()] }));
    toast.success('Đã thêm một câu hỏi mới');
  };

  const removeQuestion = (index) => {
    if (isAssigned) {
      toast.warning('Không thể xóa câu hỏi của bài test đã giao');
      return;
    }
    setForm((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
    toast.info(`Đã xóa câu hỏi số ${index + 1}`);
  };

  const moveQuestion = (from, to) => {
    if (isAssigned) return;
    setForm((prev) => {
      const next = [...prev.questions];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...prev, questions: next };
    });
  };

  const validate = () => {
    if (!form.name.trim()) return 'Tên bài kiểm tra là bắt buộc';
    if (form.passingScore > totalScore) {
      return `Điểm đạt (${form.passingScore}đ) không được lớn hơn tổng điểm của bài thi (${totalScore}đ)`;
    }
    if (!form.questions.length) return 'Phải có ít nhất 1 câu hỏi';

    for (const [idx, q] of form.questions.entries()) {
      const qNum = idx + 1;
      if (!q.question?.trim()) return `Câu hỏi số ${qNum} chưa nhập nội dung`;
      if (!q.options || q.options.length < 2) return `Câu hỏi số ${qNum} cần ít nhất 2 đáp án`;
      if (!q.options.some((o) => o.isCorrect)) return `Vui lòng chọn đáp án đúng cho Câu hỏi số ${qNum}`;
      for (const [optIdx, opt] of q.options.entries()) {
        if (!opt.text.trim()) return `Đáp án thứ ${optIdx + 1} của Câu hỏi số ${qNum} chưa nhập nội dung`;
      }
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
        toast.success('Cập nhật bài kiểm tra thành công');
      } else {
        await testService.createTest(form);
        toast.success('Tạo bài kiểm tra thành công');
      }
      navigate('/tests');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Không thể lưu bài kiểm tra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-16 p-6 max-w-7xl mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="border-b border-gray-100 pb-5 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-48" />
          <div className="flex items-center gap-3">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="h-6 bg-gray-200 rounded-full w-24" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>

        {/* Layout Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border border-gray-100 rounded-2xl bg-white p-5 space-y-5">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-10 bg-gray-200 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-20 bg-gray-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
              <div className="h-24 bg-gray-200 rounded-xl" />
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded-xl" />
                <div className="h-11 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-48" />
              <div className="h-6 bg-gray-200 rounded-full w-24" />
            </div>

            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl bg-white p-5 space-y-4">
                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                  <div className="h-10 bg-gray-200 rounded-xl w-1/4" />
                </div>
                <div className="space-y-3 pt-3 border-t border-gray-50">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                    <div className="h-9 bg-gray-200 rounded-xl flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                    <div className="h-9 bg-gray-200 rounded-xl flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 p-6 max-w-7xl mx-auto">
      {/* Premium Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/tests')}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors mb-1.5 group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Quay lại Thư viện bài đánh giá</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEdit ? 'Chỉnh sửa Bài đánh giá' : 'Tạo Bài đánh giá mới'}
            </h1>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-0.5 rounded-full shadow-none">
              {isEdit ? 'Chế độ chỉnh sửa' : 'Bản nháp mới'}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm">
            Thiết kế bài kiểm tra trắc nghiệm chuyên môn để đánh giá chính xác năng lực ứng viên trong quy trình.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Test Configuration (1/3) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
          <Card className="border border-gray-100 rounded-2xl shadow-sm overflow-hidden bg-white">
            <div className="bg-gradient-to-r from-emerald-600/5 to-teal-600/5 border-b border-gray-100 px-5 py-4">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Cấu hình bài đánh giá</span>
              </h2>
            </div>
            <CardContent className="p-5 space-y-4">
              {/* Test Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Tên bài kiểm tra</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm bg-gray-50/30 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-gray-400"
                  placeholder="Ví dụ: Kiểm tra chuyên môn ReactJS Developer"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Mô tả ngắn</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm bg-gray-50/30 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-gray-400 min-h-[90px] resize-none"
                  placeholder="Mô tả mục đích bài kiểm tra, đối tượng đánh giá..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Duration and Passing Score */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Thời lượng (phút)</span>
                  </label>
                  <input
                    type="number"
                    disabled={isAssigned}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm bg-gray-50/30 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    min="1"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-gray-400" />
                    <span>Điểm đạt</span>
                  </label>
                  <input
                    type="number"
                    disabled={isAssigned}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm bg-gray-50/30 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    min="0"
                    value={form.passingScore}
                    onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Thống kê và Progress bar */}
              <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4.5 space-y-3.5 mt-2">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="border-r border-gray-200/60">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Tổng điểm bài thi</p>
                    <p className="text-xl font-black text-gray-800 mt-0.5">{totalScore}đ</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Yêu cầu cần đạt</p>
                    <p className={`text-xl font-black mt-0.5 transition-all duration-300 ${form.passingScore > totalScore ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>{form.passingScore}đ</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>Độ khó yêu cầu</span>
                    <span className={`font-semibold transition-colors duration-300 ${form.passingScore > totalScore ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                      {form.passingScore > totalScore ? 'Vượt quá tổng điểm!' : `${passingRatePercentage}% tổng điểm`}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200/60 rounded-full h-2 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        form.passingScore > totalScore
                          ? 'bg-red-500 animate-pulse'
                          : passingRatePercentage > 80
                          ? 'bg-amber-500'
                          : passingRatePercentage > 0
                          ? 'bg-emerald-500'
                          : 'bg-gray-300'
                      }`}
                      style={{ width: `${form.passingScore > totalScore ? 100 : passingRatePercentage}%` }}
                    />
                  </div>
                  {form.passingScore > totalScore && (
                    <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1 mt-1 animate-bounce">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Điểm đạt phải nhỏ hơn hoặc bằng tổng điểm bài thi!</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                {!isAssigned && (
                  <Button
                    onClick={addQuestion}
                    variant="outline"
                    className="w-full border-dashed border-emerald-200 text-emerald-700 hover:bg-emerald-50/50 rounded-xl h-10 font-bold transition-all shadow-none flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    Thêm câu hỏi mới
                  </Button>
                )}
                <Button
                  disabled={saving}
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl h-10.5 font-bold shadow-md shadow-emerald-100 hover:shadow-lg hover:shadow-emerald-100/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4.5 h-4.5" />
                  <span>{saving ? 'Đang lưu bài...' : 'Lưu cấu hình test'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Questions List (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cảnh báo Bài test đã được giao cho ứng viên (UX cực kỳ tinh tế) */}
          {isAssigned && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 flex items-start gap-3 shadow-sm animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Bài kiểm tra đã được giao cho ứng viên</h4>
                <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                  Bài kiểm tra này hiện tại đã được giao cho ứng viên hoặc đã có kết quả làm bài. Để bảo toàn tính toàn vẹn dữ liệu và độ chính xác của kết quả, cấu trúc đề thi (các câu hỏi, lựa chọn đáp án, điểm số, thời lượng) đã được **khóa chế độ chỉnh sửa**. Bạn chỉ có thể sửa Tên và Mô tả ngắn.
                </p>
                <p className="text-xs text-amber-700/95 mt-2.5 font-semibold">
                  💡 Mẹo: Nếu muốn sửa nội dung câu hỏi, vui lòng dùng chức năng <span className="text-emerald-700 underline font-bold">Nhân bản (Duplicate)</span> ở ngoài Thư viện để tạo một bản test mới (V2) và chỉnh sửa thoải mái!
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>Nội dung & Danh sách câu hỏi</span>
            </h2>
            <Badge className="bg-gray-100 text-gray-600 font-semibold px-2.5 py-0.5 rounded-full shadow-none border-0">
              Tổng cộng {form.questions.length} câu hỏi
            </Badge>
          </div>

          {form.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 shadow-inner">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Chưa có câu hỏi nào</h3>
              <p className="text-sm text-gray-400 max-w-sm mb-5">
                Nhấp nút bên dưới để tạo câu hỏi trắc nghiệm chuyên môn đầu tiên cho bài kiểm tra này.
              </p>
              <Button
                onClick={addQuestion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-4 gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm câu hỏi đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {form.questions.map((q, idx) => (
                <Card
                  key={idx}
                  className="group border border-gray-100 hover:border-emerald-200/80 hover:shadow-lg hover:shadow-emerald-50/20 rounded-2xl transition-all duration-300 overflow-hidden bg-white"
                >
                  <div className="bg-gray-50/60 border-b border-gray-100 px-5 py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-emerald-600 text-white text-[11px] font-bold rounded-lg px-2.5 py-0.5 shadow-sm">
                        CÂU HỎI {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm một đáp án' : q.type}
                      </span>
                    </div>

                    {/* Controller Action buttons */}
                    {!isAssigned && (
                      <div className="flex items-center gap-1.5">
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-100 rounded-lg transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={idx === 0}
                          onClick={() => moveQuestion(idx, idx - 1)}
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-100 rounded-lg transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={idx === form.questions.length - 1}
                          onClick={() => moveQuestion(idx, idx + 1)}
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-100 hover:border-red-150 rounded-lg transition-all shadow-sm"
                          onClick={() => removeQuestion(idx)}
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 space-y-4">
                    {/* Question Title & Score in a row */}
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Title Input */}
                      <div className="flex-1 space-y-1.5">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nội dung câu hỏi</label>
                        <input
                          disabled={isAssigned}
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm bg-gray-50/20 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-gray-400 disabled:opacity-75 disabled:cursor-not-allowed"
                          value={q.question}
                          onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                          placeholder="Ví dụ: Component lifecycle nào chạy ngay sau khi component mount vào DOM?"
                        />
                      </div>
                      {/* Score Input */}
                      <div className="w-full md:w-32 shrink-0 space-y-1.5">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Điểm số</label>
                        <input
                          type="number"
                          disabled={isAssigned}
                          className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm bg-gray-50/20 hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-center font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                          min="1"
                          value={q.score}
                          onChange={(e) => updateQuestion(idx, { score: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    {/* Answers Options */}
                    <div className="space-y-2.5 pt-2 border-t border-gray-50">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <span>Các lựa chọn đáp án</span>
                          {!isAssigned && <span className="text-[10px] text-gray-400 lowercase font-medium">(tích chọn nút tròn cho đáp án đúng)</span>}
                        </label>
                      </div>

                      <div className="space-y-2">
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-3 group/opt">
                            {/* Custom Radio Button */}
                            <label className={`relative flex items-center justify-center shrink-0 ${isAssigned ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                              <input
                                type="radio"
                                className="sr-only"
                                disabled={isAssigned}
                                checked={opt.isCorrect}
                                onChange={() => {
                                  const nextOpts = (q.options || []).map((o, i) => ({ ...o, isCorrect: i === optIdx }));
                                  updateQuestion(idx, { options: nextOpts });
                                }}
                              />
                              <div
                                className={`w-6 h-6 rounded-full border transition-all flex items-center justify-center ${
                                  opt.isCorrect
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-200 disabled:opacity-60'
                                    : 'border-gray-200 bg-white hover:border-emerald-400 disabled:opacity-60'
                                }`}
                              >
                                {opt.isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </label>

                            {/* Option Input Text */}
                            <input
                              disabled={isAssigned}
                              className={`flex-1 border rounded-xl px-3.5 py-1.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 disabled:opacity-75 disabled:cursor-not-allowed ${
                                opt.isCorrect
                                  ? 'border-emerald-200 bg-emerald-50/15 focus:border-emerald-400 focus:bg-emerald-50/5 text-gray-900 font-medium'
                                  : 'border-gray-200 bg-gray-50/10 hover:border-gray-300 focus:border-emerald-400 focus:bg-white text-gray-700'
                              }`}
                              value={opt.text}
                              placeholder={`Đáp án thứ ${optIdx + 1}`}
                              onChange={(e) => {
                                const nextOpts = [...(q.options || [])];
                                nextOpts[optIdx] = { ...nextOpts[optIdx], text: e.target.value };
                                updateQuestion(idx, { options: nextOpts });
                              }}
                            />

                            {/* Remove Option Button */}
                            {!isAssigned && (
                              <button
                                disabled={(q.options || []).length <= 2}
                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/opt:opacity-100 focus:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed"
                                onClick={() => {
                                  const nextOpts = (q.options || []).filter((_, i) => i !== optIdx);
                                  // Nếu đáp án bị xóa đang là đáp án đúng, tự động chọn đáp án đầu tiên làm đúng
                                  if (opt.isCorrect && nextOpts.length > 0) {
                                    nextOpts[0].isCorrect = true;
                                  }
                                  updateQuestion(idx, { options: nextOpts });
                                }}
                                title="Xóa đáp án này"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add Option Button */}
                      {!isAssigned && (
                        <button
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/60 transition-colors mt-2"
                          onClick={() => {
                            const nextOpts = [...(q.options || []), { text: '', isCorrect: false }];
                            updateQuestion(idx, { options: nextOpts });
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm lựa chọn đáp án</span>
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Dashed Add Question Card at the end */}
              {!isAssigned && (
                <div
                  onClick={addQuestion}
                  className="w-full py-8 border-2 border-dashed border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/5 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-emerald-600 transition-all duration-300 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-emerald-50 text-gray-400 group-hover:text-emerald-600 border border-gray-200/50 group-hover:border-emerald-200/50 flex items-center justify-center transition-all group-hover:rotate-90 duration-300">
                    <Plus className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-sm">Thêm một câu hỏi trắc nghiệm</p>
                  <p className="text-xs text-gray-400">Soạn thảo các câu hỏi để tự động hóa quy trình sàng lọc ứng viên</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestEditor;
