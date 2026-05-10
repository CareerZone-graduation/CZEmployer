import { Handle, Position } from 'reactflow';

const ConditionNode = ({ data }) => {
  const cfg = data?.config || {};
  return (
    <div className="relative flex items-center justify-center w-36 h-36 group">
      {data?.applicantCount !== undefined && (
        <div className="absolute top-0 right-0 z-20 bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md border-2 border-white">
          {data.applicantCount}
        </div>
      )}
      <div className="absolute w-24 h-24 bg-amber-50 border-2 border-amber-400 rounded-lg transform rotate-45 shadow-sm transition-colors group-hover:bg-amber-100" />
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <p className="font-bold text-xs leading-tight max-w-[80px] break-words text-amber-900">{data?.name || 'Condition'}</p>
        <p className="text-[10px] text-amber-700 mt-1 font-mono bg-white/60 px-1 rounded truncate max-w-[90px]" title={`${cfg.field || 'field'} ${cfg.operator || '>'} ${String(cfg.value ?? '')}`}>
          {cfg.operator || '>'} {String(cfg.value ?? '')}
        </p>
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />
      <Handle type="source" id="false" position={Position.Left} className="!w-3 !h-3 !bg-red-400" />
      <Handle type="source" id="true" position={Position.Right} className="!w-3 !h-3 !bg-emerald-400" />
    </div>
  );
};

export default ConditionNode;
