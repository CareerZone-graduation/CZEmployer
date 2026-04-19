import { Handle, Position } from 'reactflow';

const ActionTestNode = ({ data }) => (
  <div className="rounded-xl border border-purple-300 bg-purple-50 min-w-[200px] px-3 py-2">
    <Handle type="target" position={Position.Top} />
    <p className="font-semibold text-sm">{data?.name || 'Assign Test'}</p>
    <p className="text-xs text-slate-600 truncate">{data?.testId ? 'Test assigned' : 'No test assigned'}</p>
    <Handle type="source" position={Position.Bottom} id="default" />
  </div>
);

export default ActionTestNode;
