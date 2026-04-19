import { Handle, Position } from 'reactflow';

const StageNode = ({ data }) => (
  <div className="rounded-xl border border-slate-300 bg-white shadow-sm min-w-[180px]">
    <Handle type="target" position={Position.Top} />
    <div className="px-3 py-2 border-b" style={{ borderColor: data?.color || '#e2e8f0' }}>
      <p className="font-semibold text-sm">{data?.name || 'Stage'}</p>
      <p className="text-xs text-slate-500">{data?.statusMapping || 'No status mapping'}</p>
    </div>
    <div className="px-3 py-2 text-xs text-slate-500">
      {data?.description || 'Không có mô tả'}
    </div>
    <Handle type="source" position={Position.Bottom} id="default" />
  </div>
);

export default StageNode;
