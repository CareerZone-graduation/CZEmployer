import { useQuery } from '@tanstack/react-query';
import * as emailTemplateService from '../../services/emailTemplateService';
import { getConditionParentKind, getConditionParentNode } from './conditionConfigSync';

const STATUS_OPTIONS = ['PENDING', 'SUITABLE', 'SCHEDULED_INTERVIEW', 'REJECTED'];

const ConditionConfig = ({ node, cfg, nodes, edges, updateConfig }) => {
  const parentNode = getConditionParentNode(node, nodes, edges);
  const parentKind = getConditionParentKind(parentNode);
  const isTestParent = parentKind === 'TEST';
  const isAIParent = parentKind === 'AI';
  const isInterviewParent = parentKind === 'INTERVIEW';

  return (
    <>
      <div className="space-y-1">
        <label className="text-xs text-slate-500">Trường dữ liệu</label>
        <select 
          className="w-full border rounded px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400" 
          value={cfg.field || 'test_score'} 
          onChange={(e) => updateConfig('field', e.target.value)}
          disabled={isTestParent || isAIParent || isInterviewParent}
        >
          <option value="test_score">Điểm Bài Test (test_score)</option>
          <option value="cv_score">Điểm CV AI đánh giá (cv_score)</option>
          <option value="interview_result">Kết quả Phỏng Vấn (interview_result)</option>
        </select>
        {(isTestParent || isAIParent || isInterviewParent) && (
          <p className="text-[10px] text-blue-500 italic mt-1">Trường này bị khóa do node trước đó quyết định.</p>
        )}
      </div>
      <div className="space-y-1 mt-2">
        <label className="text-xs text-slate-500">Toán tử</label>
        <select 
          className="w-full border rounded px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400" 
          value={cfg.operator || '>'} 
          onChange={(e) => updateConfig('operator', e.target.value)}
          disabled={isInterviewParent}
        >
          {['>', '<', '>=', '<=', '==', '!=', 'contains'].map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
      </div>
      <div className="space-y-1 mt-2">
        <label className="text-xs text-slate-500">Giá trị so sánh</label>
        {isInterviewParent ? (
          <select 
            className="w-full border rounded px-2 py-1 text-sm" 
            value={cfg.value ?? 'PASSED'} 
            onChange={(e) => updateConfig('value', e.target.value)}
          >
            <option value="PASSED">Đạt (PASSED)</option>
            <option value="FAILED">Không Đạt (FAILED)</option>
          </select>
        ) : (
          <input 
            className="w-full border rounded px-2 py-1 text-sm" 
            placeholder="Ví dụ: 70" 
            value={cfg.value ?? ''} 
            onChange={(e) => updateConfig('value', e.target.value)} 
          />
        )}
      </div>
    </>
  );
};

const EmailNodeConfig = ({ cfg, templates, handleTemplateSelect, updateConfig }) => {
  const selectedTemplate = templates.find(t => t._id === cfg.templateId);

  const parsePreviewVars = (text) => {
    if (!text) return '';
    return text
      .replace(/{{candidateName}}/g, '<Tên Ứng Viên>')
      .replace(/{{jobTitle}}/g, '<Tên Công Việc>')
      .replace(/{{companyName}}/g, '<Tên Công Ty>');
  };

  return (
    <>
      <div className="space-y-1">
        <label className="text-xs text-slate-500 font-medium">Chọn mẫu Email <span className="text-red-400">*</span></label>
        <select 
          className="w-full border rounded px-2 py-1.5 text-sm bg-blue-50 font-medium"
          value={cfg.templateId || ''} 
          onChange={(e) => handleTemplateSelect(e.target.value)}
        >
          <option value="">-- Chọn một mẫu có sẵn --</option>
          {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        {!cfg.templateId && (
          <p className="text-[10px] text-amber-600 italic mt-1">⚠ Vui lòng chọn một mẫu email để sử dụng.</p>
        )}
      </div>

      {/* Read-only preview of selected template */}
      {selectedTemplate && (
        <div className="mt-3">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex justify-between items-center">
            <span>Xem trước Email</span>
            <span className="text-[9px] text-blue-500 italic font-normal normal-case">Chỉnh sửa ở Quản lý Mẫu</span>
          </p>
          <div className="rounded border border-slate-200 overflow-hidden shadow-sm">
            {/* Mock Email Header */}
            <div className="bg-slate-800 px-2 py-1.5 flex items-center gap-2">
              <div className="flex gap-1 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              </div>
              <div className="text-[10px] text-slate-200 font-medium truncate">
                Chủ đề: {parsePreviewVars(selectedTemplate.subject)}
              </div>
            </div>
            
            {/* Mock Email Body */}
            <div style={{ backgroundColor: '#f6f6f6', width: '100%', fontFamily: 'sans-serif', padding: '10px 0' }}>
              <div style={{ display: 'block', margin: '0 auto', maxWidth: '100%', padding: '0 10px', boxSizing: 'border-box' }}>
                <div style={{ background: '#ffffff', borderRadius: '3px', border: '1px solid #eaebed', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div style={{ padding: '15px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'normal', margin: '0 0 10px 0', whiteSpace: 'pre-wrap', color: '#333333', lineHeight: '1.5' }}>
                      {parsePreviewVars(selectedTemplate.body)}
                    </div>
                  </div>
                </div>
                <div style={{ color: '#999999', fontSize: '9px', textAlign: 'center', marginTop: '10px' }}>
                  Gửi từ hệ thống tuyển dụng CareerZone
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1 mt-2">
        <label className="text-xs text-slate-500">Người nhận</label>
        <select className="w-full border rounded px-2 py-1 text-sm" value={cfg.recipient || 'CANDIDATE'} onChange={(e) => updateConfig('recipient', e.target.value)}>
          <option value="CANDIDATE">Gửi cho Ứng viên</option>
          <option value="CUSTOM">Email tùy chỉnh</option>
        </select>
        {cfg.recipient === 'CUSTOM' && (
          <input className="w-full border rounded px-2 py-1 text-sm mt-1" placeholder="Nhập địa chỉ email..." value={cfg.customEmail || ''} onChange={(e) => updateConfig('customEmail', e.target.value)} />
        )}
      </div>
    </>
  );
};

const NodeConfigPanel = ({ node, nodes = [], edges = [], tests = [], onChange, onClose }) => {
  const { data: templatesRes } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => emailTemplateService.getTemplates(),
    enabled: node?.data?.type === 'ACTION_EMAIL'
  });
  const templates = templatesRes?.data || [];

  if (!node) {
    return (
      <div className="w-80 border-l bg-white p-3 text-sm text-slate-500">
        Chọn một node để cấu hình
      </div>
    );
  }

  const cfg = node.data?.config || {};

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t._id === templateId);
    if (template) {
      onChange({
        ...node,
        data: {
          ...node.data,
          config: {
            ...cfg,
            templateId: template._id,
            subject: template.subject,
            body: template.body
          }
        }
      });
    }
  };

  const updateConfig = (key, value) => {
    onChange({
      ...node,
      data: {
        ...node.data,
        config: { ...cfg, [key]: value },
      },
    });
  };

  return (
    <div className="w-80 border-l bg-white p-3 space-y-3 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Node Config</h3>
        <button className="text-xs text-slate-500" onClick={onClose}>Đóng</button>
      </div>

      <div>
        <label className="text-xs text-slate-500">Tên node</label>
        <input
          className="w-full border rounded px-2 py-1 text-sm"
          value={node.data?.name || ''}
          onChange={(e) => onChange({ ...node, data: { ...node.data, name: e.target.value } })}
        />
      </div>

      {node.data?.type === 'STAGE' && (
        <>
          <div>
            <label className="text-xs text-slate-500">Mô tả</label>
            <textarea
              className="w-full border rounded px-2 py-1 text-sm"
              value={cfg.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Map status</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400"
              value={cfg.statusMapping || 'PENDING'}
              onChange={(e) => updateConfig('statusMapping', e.target.value)}
              disabled={cfg.isLockedStatus}
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {cfg.isLockedStatus && (
              <p className="text-[10px] text-blue-500 italic mt-1">Trạng thái này được cố định cho bước bắt đầu.</p>
            )}
          </div>
        </>
      )}

      {node.data?.type === 'CONDITION' && (
        <ConditionConfig node={node} cfg={cfg} nodes={nodes} edges={edges} updateConfig={updateConfig} />
      )}

      {node.data?.type === 'ACTION_EMAIL' && (
        <EmailNodeConfig cfg={cfg} templates={templates} handleTemplateSelect={handleTemplateSelect} updateConfig={updateConfig} node={node} onChange={onChange} />
      )}

      {node.data?.type === 'ACTION_DELAY' && (
        <>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Thời gian chờ</label>
            <input 
              type="number"
              min="1"
              className="w-full border rounded px-2 py-1 text-sm" 
              placeholder="Ví dụ: 3" 
              value={cfg.delayValue ?? ''} 
              onChange={(e) => updateConfig('delayValue', parseInt(e.target.value))} 
            />
          </div>
          <div className="space-y-1 mt-2">
            <label className="text-xs text-slate-500">Đơn vị</label>
            <select 
              className="w-full border rounded px-2 py-1 text-sm" 
              value={cfg.delayUnit || 'DAYS'} 
              onChange={(e) => updateConfig('delayUnit', e.target.value)}
            >
              <option value="DAYS">Ngày</option>
              <option value="HOURS">Giờ</option>
              <option value="MINUTES">Phút (Dùng để test)</option>
            </select>
          </div>
          <p className="text-[10px] text-amber-600 mt-1 italic leading-tight">Tiến trình sẽ tạm dừng tại đây và tự động tiếp tục sau khoảng thời gian này.</p>
        </>
      )}

      {node.data?.type === 'ACTION_AI' && (
        <div className="space-y-1">
          <label className="text-xs text-slate-500">Hành động AI</label>
          <select className="w-full border rounded px-2 py-1 text-sm bg-slate-50 text-slate-700" value="CV_SCREENING" disabled>
            <option value="CV_SCREENING">Chấm điểm CV (Khớp với JD)</option>
          </select>
          <p className="text-[10px] text-amber-600 mt-1 italic">Hệ thống sẽ giả lập trả về số điểm (0-100) để bạn test.</p>
        </div>
      )}

      {node.data?.type === 'ACTION_TEST' && (
        <select className="w-full border rounded px-2 py-1 text-sm" value={cfg.testId || ''} onChange={(e) => updateConfig('testId', e.target.value)}>
          <option value="">Chọn test</option>
          {tests.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      )}
    </div>
  );
};

export default NodeConfigPanel;
