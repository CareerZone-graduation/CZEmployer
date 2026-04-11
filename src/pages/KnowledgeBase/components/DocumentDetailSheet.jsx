import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, FileText, CheckCircle2, Clock, XCircle, Loader2,
  ExternalLink, Trash2, Tag, AlignLeft, Hash, Calendar,
  HardDrive, Edit2, Save, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDocument, updateDocument } from '@/services/knowledgeBase.service';

// ─── Constants ──────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  POLICY:     { label: 'Chính sách',    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  BENEFITS:   { label: 'Phúc lợi',      color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  CULTURE:    { label: 'Văn hóa',       color: 'bg-purple-100 text-purple-700 border-purple-200' },
  JD_TEMPLATE:{ label: 'Mẫu JD',        color: 'bg-amber-100 text-amber-700 border-amber-200' },
  HANDBOOK:   { label: 'Cẩm nang',      color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  FAQ:        { label: 'FAQ',           color: 'bg-rose-100 text-rose-700 border-rose-200' },
  OTHER:      { label: 'Khác',          color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const STATUS_META = {
  PENDING:    { label: 'Chờ xử lý',    icon: Clock,        color: 'text-amber-600 bg-amber-50 border-amber-200' },
  PROCESSING: { label: 'Đang xử lý',   icon: Loader2,      color: 'text-blue-600 bg-blue-50 border-blue-200', spin: true },
  COMPLETED:  { label: 'Hoàn thành',   icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  FAILED:     { label: 'Thất bại',     icon: XCircle,      color: 'text-red-600 bg-red-50 border-red-200' },
};

const CATEGORY_OPTIONS = [
  { value: 'POLICY',      label: 'Chính sách công ty' },
  { value: 'BENEFITS',    label: 'Phúc lợi & đãi ngộ' },
  { value: 'CULTURE',     label: 'Văn hóa doanh nghiệp' },
  { value: 'JD_TEMPLATE', label: 'Mẫu mô tả công việc' },
  { value: 'HANDBOOK',    label: 'Cẩm nang nhân viên' },
  { value: 'FAQ',         label: 'Câu hỏi thường gặp' },
  { value: 'OTHER',       label: 'Khác' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

const formatFileSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateTime = (d) => {
  if (!d) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));
};

// ─── Info Row ────────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Sheet ──────────────────────────────────────────────────────────────────

export default function DocumentDetailSheet({ doc: initialDoc, onClose, onDelete }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: initialDoc.title || '',
    description: initialDoc.description || '',
    category: initialDoc.category || '',
  });

  // Fetch fresh doc details
  const { data, isLoading } = useQuery({
    queryKey: ['knowledgeBase', 'document', initialDoc._id],
    queryFn: () => getDocument(initialDoc._id),
    initialData: { data: initialDoc },
    staleTime: 15_000,
  });

  const doc = data?.data || initialDoc;

  const statusMeta = STATUS_META[doc.status] || STATUS_META.PENDING;
  const StatusIcon = statusMeta.icon;
  const catMeta = CATEGORY_META[doc.category] || CATEGORY_META.OTHER;

  // ── Update Mutation ──

  const updateMutation = useMutation({
    mutationFn: (payload) => updateDocument(doc._id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật tài liệu');
      queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Cập nhật thất bại, vui lòng thử lại');
    },
  });

  const handleSave = () => {
    const payload = {};
    if (editForm.title.trim() !== (doc.title || '')) payload.title = editForm.title.trim();
    if (editForm.description.trim() !== (doc.description || '')) payload.description = editForm.description.trim();
    if (editForm.category !== doc.category) payload.category = editForm.category;
    if (Object.keys(payload).length === 0) { setIsEditing(false); return; }
    updateMutation.mutate(payload);
  };

  const handleCancelEdit = () => {
    setEditForm({
      title: doc.title || '',
      description: doc.description || '',
      category: doc.category || '',
    });
    setIsEditing(false);
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col gap-0">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-base font-bold text-gray-900 leading-snug truncate">
                  {doc.title || doc.fileName}
                </SheetTitle>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.fileName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mt-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusMeta.color}`}>
              <StatusIcon className={`w-3.5 h-3.5 ${statusMeta.spin ? 'animate-spin' : ''}`} />
              {statusMeta.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${catMeta.color}`}>
              {catMeta.label}
            </span>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Edit section */}
              {isEditing ? (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Tiêu đề</label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                      className="text-sm"
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Danh mục</label>
                    <Select
                      value={editForm.category}
                      onValueChange={(v) => setEditForm((p) => ({ ...p, category: v }))}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-600">Mô tả</label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="text-sm resize-none"
                      maxLength={500}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5"
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Đang lưu...</>
                        : <><Save className="w-3.5 h-3.5" />Lưu</>
                      }
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit} disabled={updateMutation.isPending}>
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : (
                doc.description && (
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium mb-1">Mô tả</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{doc.description}</p>
                  </div>
                )
              )}

              <Separator />

              {/* Meta info */}
              <div className="space-y-4">
                <InfoRow icon={Hash} label="Số chunk embedding">
                  <p className="text-sm font-semibold text-gray-900">
                    {doc.chunksCount !== undefined ? (
                      <span>{doc.chunksCount} đoạn văn bản</span>
                    ) : (
                      <span className="text-gray-400">Chưa có dữ liệu</span>
                    )}
                  </p>
                </InfoRow>

                <InfoRow icon={HardDrive} label="Kích thước file">
                  <p className="text-sm text-gray-800">{formatFileSize(doc.fileSize)}</p>
                </InfoRow>

                <InfoRow icon={Tag} label="Loại file">
                  <span className="text-xs font-mono uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {doc.fileType}
                  </span>
                </InfoRow>

                <InfoRow icon={Calendar} label="Ngày tải lên">
                  <p className="text-sm text-gray-800">{formatDateTime(doc.createdAt)}</p>
                </InfoRow>

                {doc.processedAt && (
                  <InfoRow icon={CheckCircle2} label="Thời gian xử lý xong">
                    <p className="text-sm text-gray-800">{formatDateTime(doc.processedAt)}</p>
                  </InfoRow>
                )}

                {doc.status === 'FAILED' && doc.errorMessage && (
                  <InfoRow icon={AlertCircle} label="Lỗi xử lý">
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2">
                      {doc.errorMessage}
                    </p>
                  </InfoRow>
                )}
              </div>

              {/* View file link */}
              {doc.fileUrl && (
                <>
                  <Separator />
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Mở file gốc
                  </a>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/60 flex-shrink-0">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setIsEditing(true)}
              disabled={doc.status === 'PROCESSING'}
            >
              <Edit2 className="w-3.5 h-3.5" />
              Chỉnh sửa
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 ml-auto"
            onClick={() => onDelete(doc)}
            disabled={doc.status === 'PROCESSING'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa tài liệu
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
