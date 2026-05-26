import { Handle, Position } from 'reactflow';
import { Sparkles } from 'lucide-react';

const ActionAINode = ({ data }) => {
  const cfg = data?.config || {};
  return (
    <div className="rounded-xl border-2 border-pink-300 bg-white shadow-md min-w-[220px] relative transition-all hover:shadow-lg">
      {data?.applicantCount !== undefined && (
        <div className="absolute -top-3 -right-3 z-10 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-white">
          {data.applicantCount}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />
      
      <div className="px-3 py-2 border-b border-pink-100 bg-pink-50/80 flex items-center gap-3 rounded-t-xl">
        <div className="p-1.5 bg-pink-100 text-pink-600 rounded-md shadow-sm">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <p className="font-bold text-sm text-pink-900 leading-tight">{data?.name || 'Quyết định bởi AI'}</p>
          <p className="text-[9px] text-pink-500 font-semibold tracking-wider uppercase mt-0.5">AI Agent Decision</p>
        </div>
      </div>
      
      <div className="px-4 py-3 text-xs bg-white rounded-b-xl flex flex-col gap-1.5">
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tiêu chí đánh giá:</span>
        {cfg.criteria ? (
          <p className="text-slate-700 bg-slate-50 border border-slate-100 rounded p-1.5 text-[11px] line-clamp-3 leading-relaxed break-all" title={cfg.criteria}>
            {cfg.criteria}
          </p>
        ) : (
          <span className="text-slate-400 italic text-[11px] bg-slate-50 border border-dashed border-slate-200 rounded p-1.5 text-center">Chưa cấu hình tiêu chí</span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="default" className="!w-3 !h-3 !bg-slate-400" />
    </div>
  );
};

export default ActionAINode;
