import { useState, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Upload, X, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uploadDocument } from '@/services/knowledgeBase.service';

// ─── Constants ──────────────────────────────────────────────────────────────────

const ACCEPTED_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const CATEGORY_OPTIONS = [
  { value: 'POLICY',      label: 'Chính sách công ty' },
  { value: 'BENEFITS',    label: 'Phúc lợi & đãi ngộ' },
  { value: 'CULTURE',     label: 'Văn hóa doanh nghiệp' },
  { value: 'JD_TEMPLATE', label: 'Mẫu mô tả công việc' },
  { value: 'HANDBOOK',    label: 'Cẩm nang nhân viên' },
  { value: 'FAQ',         label: 'Câu hỏi thường gặp' },
  { value: 'OTHER',       label: 'Khác' },
];

// ─── File Preview Card ───────────────────────────────────────────────────────────

function FilePreview({ file, onRemove }) {
  const sizeKB = (file.size / 1024).toFixed(1);
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const display = file.size < 1024 * 1024 ? `${sizeKB} KB` : `${sizeMB} MB`;

  return (
    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{display} · {file.name.split('.').pop().toUpperCase()}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="w-7 h-7 rounded-full hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Drop Zone ───────────────────────────────────────────────────────────────────

function DropZone({ onFile, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }, [onFile]);

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    e.target.value = '';
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all py-10 px-6
        ${isDragging
          ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
          : error
            ? 'border-red-300 bg-red-50/50 hover:border-red-400'
            : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleChange}
        className="hidden"
      />
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
        ${isDragging ? 'bg-emerald-100' : 'bg-gray-100'}`}
      >
        <Upload className={`w-6 h-6 transition-colors ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700">
          {isDragging ? 'Thả file vào đây' : 'Kéo & thả hoặc click để chọn file'}
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX · Tối đa {MAX_SIZE_MB}MB</p>
      </div>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────────

export default function DocumentUploadModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', category: '' });

  const validateFile = (f) => {
    if (!ACCEPTED_TYPES[f.type]) {
      setFileError('Chỉ hỗ trợ file PDF, DOC và DOCX');
      return false;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setFileError(`File quá lớn, tối đa ${MAX_SIZE_MB}MB`);
      return false;
    }
    setFileError('');
    return true;
  };

  const handleFile = (f) => {
    if (validateFile(f)) {
      setFile(f);
      // Auto-fill title from filename if empty
      if (!form.title) {
        const name = f.name.replace(/\.[^.]+$/, '');
        setForm((prev) => ({ ...prev, title: name }));
      }
    }
  };

  const mutation = useMutation({
    mutationFn: (formData) => uploadDocument(formData),
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || 'Tải lên thất bại, vui lòng thử lại';
      toast.error(msg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) { setFileError('Vui lòng chọn file'); return; }

    const formData = new FormData();
    formData.append('file', file);
    if (form.title.trim()) formData.append('title', form.title.trim());
    if (form.description.trim()) formData.append('description', form.description.trim());
    if (form.category) formData.append('category', form.category);

    mutation.mutate(formData);
  };

  const isPending = mutation.isPending;

  return (
    <Dialog open onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-bold text-gray-900">
            Tải lên tài liệu
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Tài liệu sẽ được AI phân tích và tạo embedding để hỗ trợ ứng viên.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-5">
            {/* Drop Zone or File Preview */}
            {!file ? (
              <div>
                <DropZone onFile={handleFile} error={!!fileError} />
                {fileError && (
                  <p className="flex items-center gap-1.5 mt-2 text-sm text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fileError}
                  </p>
                )}
              </div>
            ) : (
              <FilePreview file={file} onRemove={() => { setFile(null); setFileError(''); }} />
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-title" className="text-sm font-medium text-gray-700">
                Tiêu đề tài liệu
              </Label>
              <Input
                id="doc-title"
                placeholder="VD: Chính sách nghỉ phép 2024"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                maxLength={200}
                className="text-sm"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Danh mục
                <span className="text-gray-400 font-normal ml-1">(tuỳ chọn)</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="AI sẽ tự phân loại nếu để trống" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Nếu để trống, AI sẽ tự động phân loại dựa trên nội dung tài liệu.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="doc-desc" className="text-sm font-medium text-gray-700">
                Mô tả ngắn
                <span className="text-gray-400 font-normal ml-1">(tuỳ chọn)</span>
              </Label>
              <Textarea
                id="doc-desc"
                placeholder="Mô tả ngắn về nội dung tài liệu..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                maxLength={500}
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            {/* Info */}
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Sau khi tải lên, hệ thống sẽ tự động trích xuất văn bản, phân đoạn và tạo vector embedding.
                Quá trình này thường mất 1–3 phút tùy kích thước file.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 min-w-[130px]"
              disabled={isPending || !file}
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Đang tải lên...</>
              ) : (
                <><Upload className="w-4 h-4" />Tải lên</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
