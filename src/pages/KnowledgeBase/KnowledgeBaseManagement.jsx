import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload, FileText, Trash2, RefreshCw, Search, Filter,
  BookOpen, BarChart3, CheckCircle2, Clock, XCircle,
  ChevronRight, Eye, AlertCircle, Loader2, Plus,
  FileType, FileBox, Layers, TrendingUp, Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  getDocuments,
  getStats,
  deleteDocument,
  uploadDocument,
  retryDocument,
} from '@/services/knowledgeBase.service';
import DocumentUploadModal from './components/DocumentUploadModal';
import DocumentDetailSheet from './components/DocumentDetailSheet';

// ─── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  POLICY:     { label: 'Chính sách',    color: 'bg-blue-100 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  BENEFITS:   { label: 'Phúc lợi',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  CULTURE:    { label: 'Văn hóa',       color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  JD_TEMPLATE:{ label: 'Mẫu JD',        color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  HANDBOOK:   { label: 'Cẩm nang',      color: 'bg-cyan-100 text-cyan-700 border-cyan-200',       dot: 'bg-cyan-500' },
  FAQ:        { label: 'FAQ',           color: 'bg-rose-100 text-rose-700 border-rose-200',        dot: 'bg-rose-500' },
  OTHER:      { label: 'Khác',          color: 'bg-gray-100 text-gray-600 border-gray-200',        dot: 'bg-gray-400' },
};

const STATUS_META = {
  PENDING:    { label: 'Chờ xử lý',    icon: Clock,        color: 'text-amber-600 bg-amber-50 border-amber-200' },
  PROCESSING: { label: 'Đang xử lý',   icon: Loader2,      color: 'text-blue-600 bg-blue-50 border-blue-200',   spin: true },
  COMPLETED:  { label: 'Hoàn thành',   icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  FAILED:     { label: 'Thất bại',     icon: XCircle,      color: 'text-red-600 bg-red-50 border-red-200' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatFileSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }).format(new Date(d));
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'text-emerald-600', bg = 'bg-emerald-50' }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
          <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.color}`}>
      <Icon className={`w-3.5 h-3.5 ${meta.spin ? 'animate-spin' : ''}`} />
      {meta.label}
    </span>
  );
}

// ─── Category Badge ─────────────────────────────────────────────────────────────

function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.OTHER;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

// ─── Document Row ───────────────────────────────────────────────────────────────

function DocumentRow({ doc, onView, onDelete, onRetry }) {
  const isProcessing = doc.status === 'PROCESSING';
  const isFailed = doc.status === 'FAILED';

  return (
    <tr className="group border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
      {/* File Info */}
      <td className="py-4 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[260px]">
              {doc.title || doc.fileName}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">{doc.fileName}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-4 px-3">
        <CategoryBadge category={doc.category} />
      </td>

      {/* Status */}
      <td className="py-4 px-3">
        <StatusBadge status={doc.status} />
      </td>

      {/* Type */}
      <td className="py-4 px-3">
        <span className="text-xs font-mono uppercase text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {doc.fileType}
        </span>
      </td>

      {/* Size */}
      <td className="py-4 px-3 text-sm text-gray-500">
        {formatFileSize(doc.fileSize)}
      </td>

      {/* Created */}
      <td className="py-4 px-3 text-sm text-gray-500">
        {formatDate(doc.createdAt)}
      </td>

      {/* Actions */}
      <td className="py-4 pl-3 pr-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={() => onView(doc)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xem chi tiết</TooltipContent>
          </Tooltip>

          {isFailed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-amber-400 hover:text-amber-600 hover:bg-amber-50"
                  onClick={() => onRetry(doc)}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Thử lại xử lý</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => onDelete(doc)}
                disabled={isProcessing}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isProcessing ? 'Không thể xóa khi đang xử lý' : 'Xóa tài liệu'}
            </TooltipContent>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────────

function EmptyState({ filtered, onUpload }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center mb-5">
        <BookOpen className="w-9 h-9 text-emerald-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {filtered ? 'Không tìm thấy tài liệu' : 'Chưa có tài liệu nào'}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        {filtered
          ? 'Thử điều chỉnh bộ lọc để tìm tài liệu phù hợp.'
          : 'Tải lên tài liệu nội bộ để ứng viên có thể hỏi AI chatbot về công ty của bạn.'}
      </p>
      {!filtered && (
        <Button
          onClick={onUpload}
          className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
        >
          <Upload className="w-4 h-4" />
          Tải lên tài liệu đầu tiên
        </Button>
      )}
    </div>
  );
}

// ─── Skeleton Row ───────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-48 mb-1.5" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </td>
      <td className="py-4 px-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
      <td className="py-4 px-3"><Skeleton className="h-6 w-24 rounded-full" /></td>
      <td className="py-4 px-3"><Skeleton className="h-5 w-12 rounded" /></td>
      <td className="py-4 px-3"><Skeleton className="h-4 w-16" /></td>
      <td className="py-4 px-3"><Skeleton className="h-4 w-20" /></td>
      <td className="py-4 pl-3 pr-4"><Skeleton className="h-8 w-16 rounded" /></td>
    </tr>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function KnowledgeBaseManagement() {
  const queryClient = useQueryClient();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: 'all', status: 'all', page: 1, size: 10 });

  // ── Queries ──

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['knowledgeBase', 'stats'],
    queryFn: getStats,
    staleTime: 30_000,
  });

  const stats = statsData?.data;

  const queryParams = {
    page: filters.page,
    size: filters.size,
    ...(filters.category !== 'all' && { category: filters.category }),
    ...(filters.status !== 'all' && { status: filters.status }),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['knowledgeBase', 'documents', queryParams],
    queryFn: () => getDocuments(queryParams),
    staleTime: 20_000,
    keepPreviousData: true,
  });

  const documents = data?.data || [];
  const meta = data?.meta;

  // Client-side search filter
  const filtered = search.trim()
    ? documents.filter(
        (d) =>
          d.fileName.toLowerCase().includes(search.toLowerCase()) ||
          (d.title || '').toLowerCase().includes(search.toLowerCase())
      )
    : documents;

  // ── Delete Mutation ──

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDocument(id),
    onSuccess: () => {
      toast.success('Đã xóa tài liệu thành công');
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      setDocToDelete(null);
    },
    onError: () => {
      toast.error('Không thể xóa tài liệu, vui lòng thử lại');
    },
  });

  // ── Retry Mutation ──

  const retryMutation = useMutation({
    mutationFn: (id) => retryDocument(id),
    onSuccess: () => {
      toast.success('Đã gửi lại yêu cầu xử lý, vui lòng chờ...');
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
    },
    onError: () => {
      toast.error('Không thể thử lại, vui lòng thử lại sau');
    },
  });

  // ── Handlers ──

  const handleFilterChange = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val, page: 1 }));

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
    toast.success('Tài liệu đã được tải lên, đang xử lý embedding...');
  };

  const totalSize = stats?.totalSize ?? 0;
  const isFiltered = filters.category !== 'all' || filters.status !== 'all' || !!search.trim();

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý tài liệu nội bộ để AI chatbot hỗ trợ ứng viên
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] })}
                disabled={isFetching}
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Làm mới</TooltipContent>
          </Tooltip>
          <Button
            onClick={() => setIsUploadOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2"
            disabled={(stats?.totalDocuments ?? 0) >= 10}
          >
            <Plus className="w-4 h-4" />
            Tải lên tài liệu
          </Button>
        </div>
      </div>

      {/* ── Limit Warning ── */}
      {(stats?.totalDocuments ?? 0) >= 10 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Bạn đã đạt giới hạn <strong>10 tài liệu</strong>. Xóa bớt để tải lên tài liệu mới.
        </div>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Layers}
          label="Tổng tài liệu"
          value={statsLoading ? '…' : stats?.totalDocuments ?? 0}
          sub={`Còn lại ${10 - (stats?.totalDocuments ?? 0)} slot`}
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={CheckCircle2}
          label="Đã xử lý"
          value={statsLoading ? '…' : stats?.byStatus?.COMPLETED ?? 0}
          sub="Sẵn sàng trả lời"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={Clock}
          label="Đang xử lý"
          value={statsLoading ? '…' : (stats?.byStatus?.PENDING ?? 0) + (stats?.byStatus?.PROCESSING ?? 0)}
          sub="Embedding đang chạy"
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          icon={FileBox}
          label="Tổng dung lượng"
          value={statsLoading ? '…' : formatFileSize(totalSize)}
          sub="Giới hạn 5MB/file"
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* ── Category breakdown ── */}
      {!statsLoading && stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats.byCategory).map(([cat, count]) => {
            const meta = CATEGORY_META[cat] || CATEGORY_META.OTHER;
            return (
              <button
                key={cat}
                onClick={() => handleFilterChange('category', filters.category === cat ? 'all' : cat)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${filters.category === cat
                    ? `${meta.color} ring-2 ring-offset-1 ring-current`
                    : `${meta.color} hover:opacity-80`
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
                <span className="font-bold">{count}</span>
              </button>
            );
          })}
          {filters.category !== 'all' && (
            <button
              onClick={() => handleFilterChange('category', 'all')}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 underline"
            >
              Xóa lọc
            </button>
          )}
        </div>
      )}

      {/* ── Documents Table ── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm tên file hoặc tiêu đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white border-gray-200 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={filters.status}
              onValueChange={(v) => handleFilterChange('status', v)}
            >
              <SelectTrigger className="h-9 w-[150px] text-sm border-gray-200">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(v) => handleFilterChange('category', v)}
            >
              <SelectTrigger className="h-9 w-[140px] text-sm border-gray-200">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {Object.entries(CATEGORY_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Count */}
          {!isLoading && (
            <span className="text-xs text-gray-400 whitespace-nowrap ml-auto">
              {filtered.length} / {meta?.total ?? documents.length} tài liệu
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tài liệu</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Danh mục</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kích thước</th>
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày tải</th>
                <th className="py-3 pl-3 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState filtered={isFiltered} onUpload={() => setIsUploadOpen(true)} />
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <DocumentRow
                    key={doc._id}
                    doc={doc}
                    onView={setSelectedDoc}
                    onDelete={setDocToDelete}
                    onRetry={(doc) => retryMutation.mutate(doc._id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Trang <strong>{meta.page}</strong> / {meta.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={filters.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                disabled={filters.page >= meta.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Info Banner ── */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-900">Cách hoạt động</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Sau khi tải lên, hệ thống sẽ tự động phân tích và tạo embedding cho tài liệu.
            Ứng viên có thể đặt câu hỏi qua AI chatbot trong trang chi tiết công việc, và AI sẽ trả lời
            dựa trên nội dung tài liệu của bạn.
          </p>
        </div>
      </div>

      {/* ── Modals ── */}
      {isUploadOpen && (
        <DocumentUploadModal
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {selectedDoc && (
        <DocumentDetailSheet
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onDelete={(doc) => { setSelectedDoc(null); setDocToDelete(doc); }}
        />
      )}

      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tài liệu này?</AlertDialogTitle>
            <AlertDialogDescription>
              Tài liệu <strong>"{docToDelete?.title || docToDelete?.fileName}"</strong> và toàn bộ
              dữ liệu embedding sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteMutation.mutate(docToDelete._id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xóa...</>
              ) : 'Xóa tài liệu'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
