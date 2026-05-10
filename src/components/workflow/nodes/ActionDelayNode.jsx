import { Handle, Position } from 'reactflow';
import { Clock } from 'lucide-react';

const ActionDelayNode = ({ data }) => {
  const cfg = data?.config || {};
  
  const getDelayText = () => {
    if (!cfg.delayValue) return <span className="text-slate-400 italic">Chưa cấu hình thời gian chờ</span>;
    const unitText = cfg.delayUnit === 'HOURS' ? 'Giờ' : cfg.delayUnit === 'MINUTES' ? 'Phút' : 'Ngày';
    return <span className="font-medium text-amber-700">Chờ {cfg.delayValue} {unitText}</span>;
  };

  return (
    <div className="rounded-xl border-2 border-amber-200 bg-white shadow-sm min-w-[220px] relative">
      {data?.applicantCount !== undefined && (
        <div className="absolute -top-3 -right-3 z-10 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-white">
          {data.applicantCount}
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />
      <div className="px-3 py-2 border-b border-amber-100 bg-amber-50/80 flex items-center gap-3 rounded-t-xl">
        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-md shadow-sm">
          <Clock className="w-4 h-4" />
        </div>
        <div>
          <p className="font-bold text-sm text-amber-900 leading-tight">{data?.name || 'Chờ thời gian'}</p>
        </div>
      </div>
      <div className="px-4 py-3 text-xs text-slate-600 bg-white rounded-b-xl flex items-center gap-2">
        {getDelayText()}
      </div>
      <Handle type="source" position={Position.Bottom} id="default" className="!w-3 !h-3 !bg-slate-400" />
    </div>
  );
};

export default ActionDelayNode;
