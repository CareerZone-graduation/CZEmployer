import { Handle, Position } from 'reactflow';
import { Layers } from 'lucide-react';

const StageNode = ({ data }) => {
  return (
    <div className="rounded-xl border-2 bg-white shadow-sm min-w-[220px] border-indigo-200 relative">
      {data?.applicantCount !== undefined && (
        <div className="absolute -top-3 -right-3 z-10 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-white">
          {data.applicantCount}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />
      <div className="px-3 py-2 border-b bg-indigo-50/80 flex items-center gap-3 rounded-t-xl" style={{ borderColor: data?.color || '#e0e7ff' }}>
        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md shadow-sm">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-sm text-indigo-900 leading-tight">{data?.name || 'Stage'}</p>
          <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">{data?.config?.statusMapping || 'PENDING'}</p>
        </div>
      </div>
      <div className="px-4 py-3 text-xs text-slate-600 bg-white rounded-b-xl">
        {data?.config?.description || <span className="italic text-slate-400">Không có mô tả</span>}
      </div>
      <Handle type="source" position={Position.Bottom} id="default" className="!w-3 !h-3 !bg-slate-400" />
    </div>
  );
};

export default StageNode;
