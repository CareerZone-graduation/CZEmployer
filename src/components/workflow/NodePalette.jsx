import { PlayCircle, ArrowRightCircle, GitBranch, Mail, Sparkles, FileText, Clock, Flag } from 'lucide-react';

const NODE_LIBRARY = [
  {
    category: 'Giai đoạn (Stage)',
    items: [
      { 
        type: 'STAGE', 
        label: 'Start (Ứng viên nộp đơn)', 
        name: 'Ứng viên nộp đơn',
        icon: PlayCircle,
        config: { statusMapping: 'PENDING', isLockedStatus: true, description: 'Giai đoạn bắt đầu khi ứng viên nộp đơn' }
      },
      { 
        type: 'STAGE', 
        label: 'Cập nhật trạng thái', 
        name: 'Cập nhật trạng thái',
        icon: ArrowRightCircle,
        config: { statusMapping: 'REVIEWING', description: 'Chuyển trạng thái đơn ứng tuyển sang Đang xem xét hoặc khác' }
      },
      {
        type: 'END',
        label: 'Kết thúc workflow',
        name: 'Kết thúc',
        icon: Flag,
        config: {}
      },
    ]
  },
  {
    category: 'Luồng xử lý (Logic)',
    items: [
      { type: 'CONDITION', label: 'Điều kiện rẽ nhánh', name: 'Điều kiện', icon: GitBranch },
    ]
  },
  {
    category: 'Hành động (Action)',
    items: [
      { type: 'ACTION_EMAIL', label: 'Gửi Email', name: 'Gửi Email', icon: Mail },
      { type: 'ACTION_DELAY', label: 'Chờ thời gian', name: 'Chờ thời gian', icon: Clock, config: { delayValue: 1, delayUnit: 'DAYS' } },
      { type: 'ACTION_AI', label: 'Tác vụ AI', name: 'Chấm điểm CV', icon: Sparkles, config: { aiActionType: 'CV_SCREENING' } },
      { type: 'ACTION_TEST', label: 'Giao bài kiểm tra', name: 'Giao bài kiểm tra', icon: FileText },
    ]
  }
];

const NodePalette = ({ onAddNode }) => {
  const onDragStart = (event, item) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 border-r bg-white p-4 space-y-6 flex flex-col h-full overflow-y-auto">
      <div>
        <h3 className="font-semibold text-base mb-4 text-slate-800">Công cụ Workflow</h3>
        
        <div className="space-y-6">
          {NODE_LIBRARY.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.category}
              </h4>
              <div className="space-y-2">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={`${item.type}-${index}`}
                      className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors bg-white shadow-sm cursor-grab active:cursor-grabbing"
                      onClick={() => onAddNode(item)}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodePalette;
