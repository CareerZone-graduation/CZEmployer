const NODE_LIBRARY = [
  { type: 'STAGE', label: 'Stage Node' },
  { type: 'CONDITION', label: 'Condition Node' },
  { type: 'ACTION_EMAIL', label: 'Send Email Node' },
  { type: 'ACTION_NOTIFY', label: 'Notify Node' },
  { type: 'ACTION_TEST', label: 'Assign Test Node' },
];

const NodePalette = ({ onAddNode }) => {
  return (
    <div className="w-64 border-r bg-white p-3 space-y-2">
      <h3 className="font-semibold text-sm">Node Palette</h3>
      {NODE_LIBRARY.map((item) => (
        <button
          key={item.type}
          className="w-full text-left px-3 py-2 rounded-lg border hover:bg-slate-50"
          onClick={() => onAddNode(item.type)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default NodePalette;
