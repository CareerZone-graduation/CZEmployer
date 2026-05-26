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
    <div className="space-y-6 pb-12 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Premium Hero Header Card with Grid Overlay */}
      <div className="relative bg-white rounded-3xl border border-emerald-100/40 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_10px_30px_-10px_rgba(5,150,105,0.03)] overflow-hidden">
        {/* Subtle grid pattern background decorative */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(oklch(0.55 0.16 150) 1.5px, transparent 1.5px)`,
            backgroundSize: '16px 16px',
          }}
        ></div>
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>Ngân hàng Bài đánh giá</span>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100/60 font-bold px-2.5 py-0.5 rounded-full shadow-none text-xs">
                {tests.length} Bài test
              </Badge>
            </h1>
          </div>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            Quản lý các bài kiểm tra trắc nghiệm chuyên môn, đánh giá khách quan kết quả làm bài của ứng viên và tối ưu hóa các giai đoạn tuyển dụng bằng dữ liệu thực tế.
          </p>
        </div>
        
        <Button
          onClick={() => navigate('/tests/new')}
          className="bg-premium-gradient hover:opacity-90 active:scale-95 text-white border-0 rounded-xl shadow-md shadow-emerald-100/40 gap-2 font-bold transition-all px-6 h-11 shrink-0 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo bài test</span>
        </Button>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 border border-emerald-100/20 rounded-3xl bg-white animate-pulse" />
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white border border-emerald-100/30 rounded-3xl shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 flex items-center justify-center mb-5 text-emerald-600 shadow-inner">
            <FileText className="w-9 h-9" />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">
            Chưa có bài test nào
          </h3>
          <p className="text-sm font-medium text-gray-500 max-w-sm mb-6">
            Bắt đầu tạo các bài test trắc nghiệm chuyên môn để kiểm tra toàn diện kiến thức chuyên môn của ứng viên.
          </p>
          <Button
            onClick={() => navigate('/tests/new')}
            className="bg-premium-gradient hover:opacity-95 text-white border-0 gap-2 rounded-xl px-5 py-2.5 font-bold shadow-md shadow-emerald-100/50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo bài test đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((t) => (
            <div key={t._id} className="premium-card group flex flex-col justify-between overflow-hidden">
              <div className="p-6 space-y-5 flex-1">
                {/* Title with Premium Circular Icon Box */}
                <div className="flex items-start gap-4">
                  <div className="premium-icon-box shrink-0 group-hover:scale-105 group-hover:border-emerald-250 transition-transform">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-extrabold text-gray-950 text-base group-hover:text-emerald-700 transition-colors line-clamp-1 tracking-tight">
                      {t.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium line-clamp-2 min-h-[34px] leading-relaxed">
                      {t.description || 'Chưa có mô tả ngắn về nội dung bài kiểm tra này.'}
                    </p>
                  </div>
                </div>

                {/* Metadata details with Soft Tinted Green Background */}
                <div className="grid grid-cols-3 gap-2 pt-1.5 text-center text-xs">
                  <div className="bg-emerald-50/20 border border-emerald-100/20 rounded-2xl p-2.5">
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Câu hỏi</p>
                    <p className="font-extrabold text-gray-800 text-sm mt-0.5">{t.questions?.length || 0}</p>
                  </div>
                  <div className="bg-emerald-50/20 border border-emerald-100/20 rounded-2xl p-2.5">
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Thời gian</p>
                    <p className="font-extrabold text-gray-800 text-sm mt-0.5">{t.duration} phút</p>
                  </div>
                  <div className="bg-emerald-50/20 border border-emerald-100/20 rounded-2xl p-2.5">
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Lượt giao</p>
                    <p className="font-extrabold text-gray-800 text-sm mt-0.5">{t.usageCount}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons footer with cleaner visual hierarchy */}
              <div className="bg-emerald-50/10 px-6 py-4 border-t border-emerald-100/20 flex items-center justify-between gap-3 shrink-0">
                <Button
                  onClick={() => handleOpenAssignments(t)}
                  variant="ghost"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl gap-1.5 px-3 h-8.5 border border-emerald-100/40 bg-white shadow-sm cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Ứng viên làm bài</span>
                </Button>

                <div className="flex items-center gap-0.5">
                  <Button
                    onClick={() => navigate(`/tests/${t._id}/preview`)}
                    variant="ghost"
                    size="icon"
                    className="h-8.5 w-8.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg cursor-pointer transition-colors"
                    title="Xem trước"
                  >
                    <Eye className="w-4.5 h-4.5" />
                  </Button>
                  <Button
                    onClick={() => navigate(`/tests/${t._id}/edit`)}
                    variant="ghost"
                    size="icon"
                    className="h-8.5 w-8.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg cursor-pointer transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4.5 h-4.5" />
                  </Button>
                  <Button
                    onClick={() => handleDuplicate(t._id)}
                    variant="ghost"
                    size="icon"
                    className="h-8.5 w-8.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-lg cursor-pointer transition-colors"
                    title="Nhân bản"
                  >
                    <Copy className="w-4.5 h-4.5" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(t._id)}
                    variant="ghost"
                    size="icon"
                    disabled={t.usageCount > 0}
                    className="h-8.5 w-8.5 text-gray-400 hover:text-red-650 hover:bg-red-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title={t.usageCount > 0 ? "Bài test đang được sử dụng trong quy trình tuyển dụng" : "Xóa"}
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </Button>
                </div>
              </div>
            </div>
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
