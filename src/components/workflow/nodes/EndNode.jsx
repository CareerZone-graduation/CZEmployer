import { Handle, Position } from 'reactflow';
import { Flag } from 'lucide-react';

const EndNode = ({ data }) => {
  return (
    <div className="rounded-xl border-2 border-emerald-300 bg-white shadow-sm min-w-[220px] relative">
      {data?.applicantCount !== undefined && (
        <div className="absolute -top-3 -right-3 z-10 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-white">
          {data.applicantCount}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />
      <div className="px-3 py-2 border-b border-emerald-100 bg-emerald-50/80 flex items-center gap-3 rounded-t-xl">
        <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md shadow-sm">
          <Flag className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-sm text-emerald-900 leading-tight">{data?.name || 'End'}</p>
          <p className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider mt-0.5">Kết thúc workflow</p>
        </div>
      </div>
      <div className="px-4 py-3 text-xs text-slate-600 bg-white rounded-b-xl">
        Ứng viên đi tới đây sẽ được xem là đã hoàn thành workflow.
      </div>
    </div>
  );
};

export default EndNode;
