import { Handle, Position } from 'reactflow';
import { FileText } from 'lucide-react';

const ActionTestNode = ({ data }) => {
  const cfg = data?.config || {};
  return (
    <div className="rounded-xl border-2 border-violet-200 bg-white shadow-sm min-w-[220px] relative">
      {data?.applicantCount !== undefined && (
        <div className="absolute -top-3 -right-3 z-10 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-white">
          {data.applicantCount}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />
      <div className="px-3 py-2 border-b border-violet-100 bg-violet-50/80 flex items-center gap-3 rounded-t-xl">
        <div className="p-1.5 bg-violet-100 text-violet-600 rounded-md shadow-sm">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-sm text-violet-900 leading-tight">{data?.name || 'Giao bài kiểm tra'}</p>
        </div>
      </div>
      <div className="px-4 py-3 text-xs text-slate-600 bg-white rounded-b-xl flex items-center">
        {cfg.testId ? (
          <span className="inline-flex items-center gap-1.5 text-violet-700 bg-violet-50 px-2 py-1 rounded font-medium border border-violet-100 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" /> Đã chọn Test
          </span>
        ) : (
          <span className="text-slate-400 italic">Chưa chọn bài Test</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id="default" className="!w-3 !h-3 !bg-slate-400" />
    </div>
  );
};

export default ActionTestNode;
