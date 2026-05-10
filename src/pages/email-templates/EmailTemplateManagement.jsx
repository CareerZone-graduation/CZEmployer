import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, Edit, Trash2, X, GripVertical, User, Briefcase, Building2 } from 'lucide-react';
import * as emailTemplateService from '../../services/emailTemplateService';
import { toast } from 'sonner';

const TEMPLATE_VARIABLES = [
  { key: '{{candidateName}}', label: 'Tên ứng viên', icon: User, color: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200' },
  { key: '{{jobTitle}}', label: 'Tên công việc', icon: Briefcase, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  { key: '{{companyName}}', label: 'Tên công ty', icon: Building2, color: 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200' },
];

const VariableChip = ({ variable, onInsert }) => {
  const Icon = variable.icon;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', variable.key);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onInsert(variable.key)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-grab active:cursor-grabbing transition-all duration-150 shadow-sm hover:shadow ${variable.color}`}
      title={`Kéo thả hoặc nhấn để chèn ${variable.key}`}
    >
      <GripVertical className="w-3 h-3 opacity-50" />
      <Icon className="w-3.5 h-3.5" />
      <span>{variable.label}</span>
    </button>
  );
};

const EmailTemplateManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: '', subject: '', body: '' });
  const [activeField, setActiveField] = useState('body'); // 'subject' or 'body'

  const parsePreviewVars = (text) => {
    if (!text) return '';
    return text
      .replace(/{{candidateName}}/g, '<Tên Ứng Viên>')
      .replace(/{{jobTitle}}/g, '<Tên Công Việc>')
      .replace(/{{companyName}}/g, '<Tên Công Ty>');
  };

  const subjectRef = useRef(null);
  const bodyRef = useRef(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => emailTemplateService.getTemplates()
  });

  const templates = response?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => emailTemplateService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['emailTemplates']);
      toast.success('Đã tạo mẫu email mới');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => emailTemplateService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['emailTemplates']);
      toast.success('Đã cập nhật mẫu email');
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => emailTemplateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['emailTemplates']);
      toast.success('Đã xóa mẫu email');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  });

  // Insert variable text at the cursor position of the active field
  const insertVariable = useCallback((variableKey) => {
    const field = activeField;
    const ref = field === 'subject' ? subjectRef : bodyRef;
    const el = ref.current;

    if (!el) return;

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const currentValue = formData[field];
    const newValue = currentValue.slice(0, start) + variableKey + currentValue.slice(end);

    setFormData(prev => ({ ...prev, [field]: newValue }));

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      const newPos = start + variableKey.length;
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  }, [activeField, formData]);

  // Handle drop event on input/textarea
  const handleDrop = useCallback((e, field) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (!text) return;

    const el = field === 'subject' ? subjectRef.current : bodyRef.current;
    if (!el) return;

    // Get drop position from the DOM element
    // For input/textarea, we can use document.caretRangeFromPoint or fallback to end
    let insertPos = el.value.length;
    if (typeof document.caretRangeFromPoint === 'function') {
      // Works in Chrome/Edge
      const range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range && el.contains(range.startContainer)) {
        insertPos = range.startOffset;
      }
    }
    // Fallback: insert at current cursor or end
    if (el.selectionStart !== undefined) {
      insertPos = el.selectionStart;
    }

    const currentValue = formData[field];
    const newValue = currentValue.slice(0, insertPos) + text + currentValue.slice(insertPos);
    setFormData(prev => ({ ...prev, [field]: newValue }));
    setActiveField(field);

    requestAnimationFrame(() => {
      const newPos = insertPos + text.length;
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  }, [formData]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const openModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({ name: template.name, subject: template.subject, body: template.body });
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', subject: '', body: '' });
    }
    setIsModalOpen(true);
    setActiveField('body');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTemplate(null);
    setFormData({ name: '', subject: '', body: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mẫu email này?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="text-blue-600" />
            Quản lý Mẫu Email
          </h1>
          <p className="text-slate-500 mt-1">Tạo và quản lý các mẫu email dùng trong quy trình tự động hóa.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mẫu mới</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border shadow-sm">
          <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Chưa có mẫu email nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div key={template._id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-slate-800 text-lg truncate pr-16">{template.name}</h3>
                {!template.recruiterProfileId && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">Mặc định</span>
                )}
              </div>
              <div className="mb-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Tiêu đề:</span>
                <p className="text-sm text-slate-700 truncate font-medium mt-0.5">{parsePreviewVars(template.subject)}</p>
              </div>
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Nội dung:</span>
                <p className="text-sm text-slate-600 line-clamp-3 mt-0.5 whitespace-pre-wrap">{parsePreviewVars(template.body)}</p>
              </div>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => openModal(template)}
                  className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {template.recruiterProfileId && (
                  <button 
                    onClick={() => handleDelete(template._id)}
                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editingTemplate ? 'Chỉnh sửa mẫu email' : 'Tạo mẫu email mới'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên mẫu <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Mẫu từ chối (Chung)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {/* Variable Chips - Drag & Drop zone */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 p-4 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                  ⚡ Biến động — Kéo thả hoặc nhấn để chèn vào {activeField === 'subject' ? 'Tiêu đề' : 'Nội dung'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <VariableChip key={v.key} variable={v} onInsert={insertVariable} />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tiêu đề email <span className="text-red-500">*</span>
                </label>
                <input 
                  ref={subjectRef}
                  type="text" 
                  required
                  placeholder="Ví dụ: Kết quả ứng tuyển vị trí {{jobTitle}}"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${activeField === 'subject' ? 'border-blue-400 ring-1 ring-blue-200' : 'border-slate-300'}`}
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  onFocus={() => setActiveField('subject')}
                  onDrop={(e) => handleDrop(e, 'subject')}
                  onDragOver={handleDragOver}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nội dung email <span className="text-red-500">*</span>
                </label>
                <textarea 
                  ref={bodyRef}
                  required
                  rows={6}
                  placeholder="Nhập nội dung email..."
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y ${activeField === 'body' ? 'border-blue-400 ring-1 ring-blue-200' : 'border-slate-300'}`}
                  value={formData.body}
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  onFocus={() => setActiveField('body')}
                  onDrop={(e) => handleDrop(e, 'body')}
                  onDragOver={handleDragOver}
                />
              </div>

              {/* Live Preview Box */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Xem trước giao diện Email</p>
                <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  {/* Mock Email Header */}
                  <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-3">
                    <div className="flex gap-1.5 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="text-xs text-slate-200 font-medium truncate">
                      Chủ đề: {parsePreviewVars(formData.subject) || <span className="italic opacity-50">Chưa có tiêu đề...</span>}
                    </div>
                  </div>
                  
                  {/* Mock Email Body (Matching basicNotification.pug) */}
                  <div style={{ backgroundColor: '#f6f6f6', width: '100%', fontFamily: 'sans-serif', padding: '20px 0' }}>
                    <div style={{ display: 'block', margin: '0 auto', maxWidth: '600px', width: '100%', padding: '0 20px', boxSizing: 'border-box' }}>
                      <div style={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #eaebed', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '30px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 'normal', margin: '0 0 15px 0', whiteSpace: 'pre-wrap', color: '#333333', lineHeight: '1.6' }}>
                            {parsePreviewVars(formData.body) || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>Chưa có nội dung...</span>}
                          </div>
                        </div>
                      </div>
                      <div style={{ color: '#999999', fontSize: '12px', textAlign: 'center', marginTop: '20px' }}>
                        Gửi từ hệ thống tuyển dụng CareerZone
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            
            <div className="p-5 border-t bg-slate-50 rounded-b-xl flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button 
                type="submit"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {editingTemplate ? 'Lưu thay đổi' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateManagement;
