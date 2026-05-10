import { Handle, Position } from 'reactflow';
import { Mail } from 'lucide-react';

const ActionEmailNode = ({ data }) => {
  const cfg = data?.config || {};
  return (
    <div className="rounded-xl border-2 border-sky-200 bg-white shadow-sm min-w-[220px] relative">
      {data?.applicantCount !== undefined && (
        <div className="absolute -top-3 -right-3 z-10 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-white">
          {data.applicantCount}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />
      <div className="px-3 py-2 border-b border-sky-100 bg-sky-50/80 flex items-center gap-3 rounded-t-xl">
        <div className="p-1.5 bg-sky-100 text-sky-600 rounded-md shadow-sm">
          <Mail className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-sm text-sky-900 leading-tight">{data?.name || 'Gửi Email'}</p>
          <p className="text-[10px] text-sky-600 font-medium mt-0.5">{cfg.recipient === 'CUSTOM' ? cfg.customEmail : 'Tới: Ứng viên'}</p>
        </div>
      </div>
      <div className="px-4 py-3 text-xs text-slate-600 bg-white rounded-b-xl truncate max-w-[220px]" title={cfg.subject || 'Chưa có tiêu đề'}>
        <span className="font-semibold text-slate-700">Tiêu đề:</span> {cfg.subject || '...'}
      </div>
      <Handle type="source" position={Position.Bottom} id="default" className="!w-3 !h-3 !bg-slate-400" />
    </div>
  );
};

export default ActionEmailNode;
