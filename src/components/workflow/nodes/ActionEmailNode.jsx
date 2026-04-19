import { Handle, Position } from 'reactflow';

const ActionEmailNode = ({ data }) => (
  <div className="rounded-xl border border-blue-300 bg-blue-50 min-w-[200px] px-3 py-2">
    <Handle type="target" position={Position.Top} />
    <p className="font-semibold text-sm">{data?.name || 'Send Email'}</p>
    <p className="text-xs text-slate-600 truncate">{data?.subject || 'No subject'}</p>
    <Handle type="source" position={Position.Bottom} id="default" />
  </div>
);

export default ActionEmailNode;
