import { useEffect } from 'react';

const STATUS_OPTIONS = ['PENDING', 'SUITABLE', 'SCHEDULED_INTERVIEW', 'OFFER_SENT', 'ACCEPTED', 'REJECTED'];

const ConditionConfig = ({ node, cfg, nodes, edges, updateConfig }) => {
  const parentNode = edges.find(e => e.target === node.id)
    ? nodes.find(n => n.id === edges.find(e => e.target === node.id).source)
    : null;
    
  const isTestParent = parentNode?.data?.type === 'ACTION_TEST';
  const isInterviewParent = parentNode?.data?.type === 'STAGE' && 
    (parentNode.data?.config?.statusMapping === 'SCHEDULED_INTERVIEW' || 
     (parentNode.data?.name || '').toLowerCase().includes('phỏng vấn'));

  useEffect(() => {
    if (isTestParent && cfg.field !== 'test_score') {
      updateConfig('field', 'test_score');
    } else if (isInterviewParent) {
      if (cfg.field !== 'interview_result') {
        updateConfig('field', 'interview_result');
      } else if (cfg.operator !== '==') {
        updateConfig('operator', '==');
      } else if (cfg.value !== 'PASSED' && cfg.value !== 'FAILED') {
        updateConfig('value', 'PASSED');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestParent, isInterviewParent, cfg.field, cfg.operator, cfg.value]);

  return (
    <>
      <div className="space-y-1">
        <label className="text-xs text-slate-500">Trường dữ liệu</label>
        <select 
          className="w-full border rounded px-2 py-1 text-sm disabled:bg-slate-50 disabled:text-slate-400" 
          value={cfg.field || 'test_score'} 
          onChange={(e) => updateConfig('field', e.target.value)}
          disabled={isTestParent || isInterviewParent}
        >
          <option value="test_score">Điểm Bài Test (test_score)</option>
          <option value="cv_score">Điểm CV AI đánh giá (cv_score)</option>
          <option value="interview_score">Điểm Phỏng Vấn (interview_score)</option>
          <option value="interview_result">Kết quả Phỏng Vấn (interview_result)</option>
        </select>
        {(isTestParent || isInterviewParent) && (
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

const NodeConfigPanel = ({ node, nodes = [], edges = [], tests = [], onChange, onClose }) => {
  if (!node) {
    return (
      <div className="w-80 border-l bg-white p-3 text-sm text-slate-500">
        Chọn một node để cấu hình
      </div>
    );
  }

  const cfg = node.data?.config || {};

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
              className="w-full border rounded px-2 py-1 text-sm"
              value={cfg.statusMapping || 'PENDING'}
              onChange={(e) => updateConfig('statusMapping', e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </>
      )}

      {node.data?.type === 'CONDITION' && (
        <ConditionConfig node={node} cfg={cfg} nodes={nodes} edges={edges} updateConfig={updateConfig} />
      )}

      {node.data?.type === 'ACTION_EMAIL' && (
        <>
          <input className="w-full border rounded px-2 py-1 text-sm" placeholder="subject" value={cfg.subject || ''} onChange={(e) => updateConfig('subject', e.target.value)} />
          <textarea className="w-full border rounded px-2 py-1 text-sm" placeholder="email body" value={cfg.body || ''} onChange={(e) => updateConfig('body', e.target.value)} />
          <select className="w-full border rounded px-2 py-1 text-sm" value={cfg.recipient || 'CANDIDATE'} onChange={(e) => updateConfig('recipient', e.target.value)}>
            <option value="CANDIDATE">Gửi cho Ứng viên</option>
            <option value="CUSTOM">Email tùy chỉnh</option>
          </select>
          {cfg.recipient === 'CUSTOM' && (
            <input className="w-full border rounded px-2 py-1 text-sm" placeholder="Nhập địa chỉ email..." value={cfg.customEmail || ''} onChange={(e) => updateConfig('customEmail', e.target.value)} />
          )}
        </>
      )}

      {node.data?.type === 'ACTION_NOTIFY' && (
        <textarea className="w-full border rounded px-2 py-1 text-sm" placeholder="notification message" value={cfg.message || ''} onChange={(e) => updateConfig('message', e.target.value)} />
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
