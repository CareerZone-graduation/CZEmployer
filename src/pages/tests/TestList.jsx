import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus, Eye, Edit, Trash2, Copy, FileText,
  CheckCircle2, XCircle, Clock, AlertCircle, Calendar,
  Users, ChevronRight, X, ExternalLink, Award, BarChart3
} from 'lucide-react';
import * as testService from '@/services/testService';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TestList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for Candidates Drawer
  const [selectedTest, setSelectedTest] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await testService.getTests({ page: 1, limit: 100 });
      setTests(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleDelete = async (id) => {
    try {
      await testService.deleteTest(id);
      toast.success('Xóa bài test thành công');
      fetchTests();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Không thể xóa bài test');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await testService.duplicateTest(id);
      toast.success('Nhân bản bài test thành công');
      fetchTests();
    } catch {
      toast.error('Không thể nhân bản bài test');
    }
  };

  // Open candidate attempts drawer
  const handleOpenAssignments = async (test) => {
    setSelectedTest(test);
    setIsDrawerOpen(true);
    setAssignmentsLoading(true);
    try {
      const res = await testService.getTestAssignments(test._id);
      setAssignments(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách ứng viên làm bài');
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };



  // Helper: Format Time Spent (seconds to MM:SS or X phút Y giây)
  const formatTimeSpent = (seconds) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} giây`;
    return `${m} phút ${s} giây`;
  };

  // Helper: Format Date
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate statistics for assignments
  const getAssignmentStats = () => {
    const total = assignments.length;
    if (total === 0) return { total, completed: 0, passed: 0, rate: 0 };
    const completed = assignments.filter(a => a.status === 'COMPLETED').length;
    const passed = assignments.filter(a => a.status === 'COMPLETED' && a.passed).length;
    const rate = Math.round((passed / total) * 100);
    return { total, completed, passed, rate };
  };

  const stats = getAssignmentStats();

  return (
    <div className="space-y-6 pb-12 p-6">
      {/* Premium Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ngân hàng Bài đánh giá</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-semibold px-2 py-0.5 rounded-full">
              {tests.length} Bài test
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý các bài kiểm tra trắc nghiệm chuyên môn, xem chi tiết kết quả làm bài của ứng viên và kiểm soát tiến độ tuyển dụng.
          </p>
        </div>
        <Button
          onClick={() => navigate('/tests/new')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm gap-2 font-semibold transition-all px-5"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo bài test</span>
        </Button>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 border border-gray-100 rounded-2xl bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white border border-gray-100 rounded-2xl shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5 text-emerald-500">
            <FileText className="w-9 h-9" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Chưa có bài test nào
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            Bắt đầu tạo các bài test trắc nghiệm chuyên môn để đánh giá năng lực ứng viên.
          </p>
          <Button
            onClick={() => navigate('/tests/new')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Tạo bài test đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((t) => (
            <Card key={t._id} className="group border border-gray-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50/40 rounded-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
              <CardContent className="p-5 space-y-4 flex-1">
                {/* Title & Badge */}
                <div className="space-y-1">
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {t.name}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px]">
                    {t.description || 'Chưa có mô tả ngắn về bài test.'}
                  </p>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-gray-50 text-xs">
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-gray-400 font-medium">Câu hỏi</p>
                    <p className="font-bold text-gray-800 text-sm mt-0.5">{t.questions?.length || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-gray-400 font-medium">Thời gian</p>
                    <p className="font-bold text-gray-800 text-sm mt-0.5">{t.duration} phút</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2 text-center">
                    <p className="text-gray-400 font-medium">Lượt giao</p>
                    <p className="font-bold text-gray-800 text-sm mt-0.5">{t.usageCount}</p>
                  </div>
                </div>
              </CardContent>

              {/* Action Buttons footer */}
              <div className="bg-gray-50/50 px-5 py-3.5 border-t border-gray-50 flex items-center justify-between gap-2 shrink-0">
                <Button
                  onClick={() => handleOpenAssignments(t)}
                  variant="ghost"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl gap-1 px-2.5 h-8"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Xem ứng viên làm bài</span>
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => navigate(`/tests/${t._id}/preview`)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg"
                    title="Xem trước"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => navigate(`/tests/${t._id}/edit`)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDuplicate(t._id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-lg"
                    title="Nhân bản"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(t._id)}
                    variant="ghost"
                    size="icon"
                    disabled={t.usageCount > 0}
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                    title={t.usageCount > 0 ? "Bài test đang được sử dụng trong quy trình tuyển dụng" : "Xóa"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Radar Candidate attempts Sheet/Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="sm:max-w-2xl w-full flex flex-col h-full bg-white p-0 border-l border-gray-100 shadow-2xl">
          {/* Header Area */}
          <SheetHeader className="p-6 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 text-emerald-600">
              <Award className="w-6 h-6" />
              <SheetTitle className="text-xl font-bold text-gray-900">Chi tiết kết quả làm bài</SheetTitle>
            </div>
            <SheetDescription className="text-gray-500 text-sm mt-1">
              Bài test: <strong className="text-gray-800 font-semibold">{selectedTest?.name}</strong> • Tổng điểm tối đa: <strong className="text-gray-800">{selectedTest?.totalScore}đ</strong>
            </SheetDescription>
          </SheetHeader>

          {/* Stats Bar */}
          {!assignmentsLoading && assignments.length > 0 && (
            <div className="bg-emerald-50/30 px-6 py-4 border-b border-gray-100 grid grid-cols-4 gap-4 text-center shrink-0">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Đã giao</p>
                <p className="text-xl font-black text-gray-800 mt-0.5">{stats.total}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Đã nộp bài</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">{stats.completed}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Đã Đạt</p>
                <p className="text-xl font-black text-teal-600 mt-0.5">{stats.passed}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tỉ lệ đạt</p>
                <p className="text-xl font-black text-emerald-700 mt-0.5">{stats.rate}%</p>
              </div>
            </div>
          )}

          {/* Candidates List content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {assignmentsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 border border-gray-50 rounded-xl bg-gray-50 animate-pulse" />
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Chưa có ứng viên tham gia</h4>
                <p className="text-sm text-gray-400 max-w-sm">
                  Bài test này chưa được thực hiện bởi ứng viên nào. Khi đơn ứng tuyển được chuyển qua bước bài test trong quy trình tự động, ứng viên sẽ nhận được thông báo để làm bài.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {assignments.map((a) => {
                  const candidateName = a.applicationId?.candidateName || a.applicationId?.candidateProfileId?.fullName || 'Ứng viên ẩn danh';
                  const candidateEmail = a.applicationId?.candidateEmail || 'Chưa cung cấp email';
                  const candidatePhone = a.applicationId?.candidatePhone || 'Chưa có SĐT';
                  const cvUrl = a.applicationId?.candidateProfileId?.cvUrl;
                  const isCompleted = a.status === 'COMPLETED';
                  const isPending = a.status === 'PENDING';
                  const isProgress = a.status === 'IN_PROGRESS';
                  const isExpired = a.status === 'EXPIRED';

                  return (
                    <div key={a._id} className="border border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/10 rounded-2xl p-4.5 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center flex-shrink-0 text-sm border border-emerald-100 shadow-inner">
                          {candidateName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <Link
                              to={`/applications/${a.applicationId?._id || a.applicationId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-emerald-600 hover:underline cursor-pointer transition-colors"
                              title="Xem hồ sơ ứng tuyển (Mở trong tab mới)"
                            >
                              {candidateName}
                            </Link>
                            {cvUrl && (
                              <a
                                href={cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-emerald-600 transition-colors inline-flex items-center"
                                title="Xem file CV"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </h4>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{candidateEmail}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">SĐT: {candidatePhone}</p>
                        </div>
                      </div>

                      {/* Middle & Right: Score & Status */}
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-1.5 ml-13 sm:ml-0 shrink-0">
                        {/* Status / Score Badges */}
                        <div className="flex items-center gap-1.5">
                          {isCompleted && (
                            <>
                              <Badge className={a.passed ? "bg-teal-50 text-teal-700 border-teal-200 border shadow-none" : "bg-red-50 text-red-600 border-red-150 border shadow-none"}>
                                {a.passed ? 'Đạt' : 'Không Đạt'}
                              </Badge>
                              <Badge className="bg-emerald-600 text-white font-bold shadow-none">
                                {a.score} / {a.totalScore}đ
                              </Badge>
                            </>
                          )}

                          {isPending && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-500 font-medium">
                              Chưa làm bài
                            </Badge>
                          )}
                          {isProgress && (
                            <Badge className="bg-blue-50 text-blue-600 border border-blue-200 shadow-none animate-pulse font-medium">
                              Đang làm bài
                            </Badge>
                          )}
                          {isExpired && (
                            <Badge variant="destructive" className="bg-red-50 text-red-500 border border-red-150 shadow-none font-medium">
                              Quá hạn làm
                            </Badge>
                          )}
                        </div>

                        {/* Date details */}
                        <div className="text-right text-[11px] text-gray-400">
                          {isCompleted && (
                            <div className="space-y-0.5">
                              <p className="flex items-center gap-1 justify-end">
                                <Clock className="w-3 h-3" />
                                {formatTimeSpent(a.timeSpent)}
                              </p>
                              <p className="flex items-center gap-1 justify-end">
                                <Calendar className="w-3 h-3" />
                                {formatDate(a.completedAt)}
                              </p>
                            </div>
                          )}

                          {isPending && (
                            <p className="flex items-center gap-1 justify-end">
                              <Calendar className="w-3 h-3" />
                              Giao: {formatDate(a.assignedAt)}
                            </p>
                          )}

                          {isProgress && (
                            <p className="flex items-center gap-1 justify-end">
                              Bắt đầu: {formatDate(a.startedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Area */}
          <div className="p-5 border-t bg-gray-50 shrink-0 flex justify-end">
            <SheetClose asChild>
              <Button className="bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold text-sm">
                Đóng
              </Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TestList;
