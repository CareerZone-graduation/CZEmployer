import { Handle, Position } from 'reactflow';
import { Sparkles } from 'lucide-react';

const ActionAINode = ({ data }) => {
  const cfg = data?.config || {};
  return (
    <div className="rounded-xl border-2 border-pink-200 bg-white shadow-sm min-w-[220px] relative">
      {data?.applicantCount !== undefined && (
        <div className="absolute -top-3 -right-3 z-10 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-white">
          {data.applicantCount}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />
      <div className="px-3 py-2 border-b border-pink-100 bg-pink-50/80 flex items-center gap-3 rounded-t-xl">
        <div className="p-1.5 bg-pink-100 text-pink-600 rounded-md shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-sm text-pink-900 leading-tight">{data?.name || 'Tác vụ AI'}</p>
        </div>
      </div>
      <div className="px-4 py-3 text-xs text-slate-600 bg-white rounded-b-xl flex items-center">
        {cfg.aiActionType === 'CV_SCREENING' ? (
          <span className="inline-flex items-center gap-1.5 text-pink-700 bg-pink-50 px-2 py-1 rounded font-medium border border-pink-100 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" /> Đang cấu hình CV Screening
          </span>
        ) : (
          <span className="text-slate-400 italic">Chưa cấu hình</span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id="default" className="!w-3 !h-3 !bg-slate-400" />
    </div>
  );
};

export default ActionAINode;
