import { Handle, Position } from 'reactflow';

const ConditionNode = ({ data }) => (
  <div className="relative bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 min-w-[220px]">
    <Handle type="target" position={Position.Top} />
    <p className="font-semibold text-sm">{data?.name || 'Condition'}</p>
    <p className="text-xs text-slate-700 mt-1">
      {data?.field || 'field'} {data?.operator || '>'} {String(data?.value ?? '')}
    </p>
    <Handle type="source" id="false" position={Position.Left} />
    <Handle type="source" id="true" position={Position.Right} />
  </div>
);

export default ConditionNode;
